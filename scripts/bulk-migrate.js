import XLSX from 'xlsx';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_DIR = '/Users/adnan/Projects/Research-survey/Databse';

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Question Schema
const QuestionSchema = new mongoose.Schema({
    order: { type: Number, required: true },
    facilityCategory: { type: String, default: '' },
    dataTitle: { type: String, default: '' },
    datasetName: { type: String, default: '' },
    dataElements: { type: String, default: '' },
    suggestedDisaggregates: { type: String, default: '' },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        // 1. Clear existing questions (as requested by user)
        console.log('Clearing existing questions...');
        await Question.deleteMany({});
        console.log('Database cleared.');

        const files = fs.readdirSync(DATABASE_DIR).filter(f => f.endsWith('.xlsx'));
        console.log(`Found ${files.length} dataset files to process.`);

        let totalQuestions = 0;
        const results = [];

        for (const file of files) {
            console.log(`\nProcessing ${file}...`);
            const filePath = path.join(DATABASE_DIR, file);
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // A. Extract Title (usually on Row 3, index 2)
            let dataTitle = data[2] && data[2][0] ? data[2][0].toString().trim() : file;
            
            // B. Find Header Row dynamically
            let headerRowIndex = -1;
            for (let r = 0; r < Math.min(data.length, 10); r++) {
                if (data[r] && data[r][0] && data[r][0].toString().includes('Facility Category')) {
                    headerRowIndex = r;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                console.log(`⚠️  Could not find headers in ${file}. Skipping.`);
                continue;
            }

            // C. Process Data Rows
            const fileQuestions = [];
            let currentCategory = '';
            let currentDataset = '';

            for (let i = headerRowIndex + 1; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length === 0) continue;

                const category = row[0] ? row[0].toString().trim() : currentCategory;
                const dataset = row[1] ? row[1].toString().trim() : currentDataset;
                const element = row[2] ? row[2].toString().trim() : '';
                const disaggregates = row[3] ? row[3].toString().trim() : '';

                // Update carry-over
                if (category) currentCategory = category;
                if (dataset) currentDataset = dataset;

                // Skip if no element name
                if (!element) continue;

                fileQuestions.push({
                    order: totalQuestions + fileQuestions.length + 1,
                    facilityCategory: currentCategory,
                    dataTitle: dataTitle,
                    datasetName: currentDataset,
                    dataElements: element,
                    suggestedDisaggregates: disaggregates
                });
            }

            if (fileQuestions.length > 0) {
                await Question.insertMany(fileQuestions);
                totalQuestions += fileQuestions.length;
                results.push({ file, title: dataTitle, count: fileQuestions.length });
                console.log(`✅ Imported ${fileQuestions.length} questions.`);
            } else {
                console.log(`ℹ️  No data found in ${file}.`);
            }
        }

        console.log('\n' + '='.repeat(40));
        console.log('MIGRATION COMPLETE');
        console.log(`TOTAL QUESTIONS: ${totalQuestions}`);
        console.log(`TOTAL DATASETS: ${results.length}`);
        console.log('='.repeat(40));

        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();
