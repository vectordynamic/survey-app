import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
    try {
        await dbConnect();

        // 1. Authenticate Admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.adminId || decoded.id;
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse Multipart Data
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 3. Parse Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 5) {
            return NextResponse.json({ error: 'Excel file format invalid (too few rows)' }, { status: 400 });
        }

        // 4. Extract Metadata
        // Row 3 (index 2) might contain the study section title
        let dataTitle = data[2] && data[2][0] ? data[2][0].toString().trim() : file.name;
        
        // 5. Process Rows (Headers are index 4, Data starts at index 5)
        const questions = [];
        let currentCategory = '';
        let currentDataset = '';

        // Row 4 (index 4) should be: ["Facility Category", "Dataset Name", "Data Elements", "Suggested Disaggregates", ...]
        for (let i = 5; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const category = row[0] ? row[0].toString().trim() : currentCategory;
            const dataset = row[1] ? row[1].toString().trim() : currentDataset;
            const element = row[2] ? row[2].toString().trim() : '';
            const disaggregates = row[3] ? row[3].toString().trim() : '';

            // Update carry-over values
            if (category) currentCategory = category;
            if (dataset) currentDataset = dataset;

            // Skip if no element name is present
            if (!element) continue;

            questions.push({
                order: questions.length + 1,
                facilityCategory: currentCategory,
                dataTitle: dataTitle,
                datasetName: currentDataset,
                dataElements: element,
                suggestedDisaggregates: disaggregates
            });
        }

        // 6. Optional: Clear existing questions or append
        const shouldClear = formData.get('clearExisting') === 'true';
        if (shouldClear) {
            await Question.deleteMany({});
        }

        // 7. Save to DB
        await Question.insertMany(questions);

        return NextResponse.json({
            success: true,
            count: questions.length,
            title: dataTitle,
            message: `Successfully uploaded ${questions.length} questions from ${dataTitle}`
        });

    } catch (error) {
        console.error('Excel Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
