import XLSX from 'xlsx';

const filePath = '/Users/adnan/Projects/Research-survey/Databse/PHC6_Prevention and control of locally endemic diseases_D1.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('PHC-6 Detailed Sample (0-10):');
    data.slice(0, 10).forEach((row, i) => {
        console.log(`${i}:`, JSON.stringify(row));
    });
} catch (err) {
    console.error('Error:', err.message);
}
