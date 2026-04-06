import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const dir = '/Users/adnan/Projects/Research-survey/Databse';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

console.log(`Found ${files.length} files.`);

files.forEach(file => {
    const filePath = path.join(dir, file);
    try {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const title = data[2] && data[2][0] ? data[2][0] : 'MISSING';
        const headers = data[4] ? JSON.stringify(data[4]) : 'MISSING';
        const rowCount = data.length - 5;

        console.log(`--- FILE: ${file} ---`);
        console.log(`TITLE: ${title}`);
        console.log(`HEADERS: ${headers}`);
        console.log(`ROWS: ${rowCount}`);
        console.log('');
    } catch (err) {
        console.log(`--- FILE: ${file} --- ERROR: ${err.message}`);
    }
});
