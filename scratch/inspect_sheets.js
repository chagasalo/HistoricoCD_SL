import axios from 'axios';
import ExcelJS from 'exceljs';

const SHEET_URL = process.env.SHEET_URL;

async function inspectSheet() {
  console.log('Downloading Excel file...');
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  console.log('Sheets found:', workbook.worksheets.map(w => w.name));

  for (const worksheet of workbook.worksheets) {
    const name = worksheet.name.toUpperCase();
    if (name.includes('E.O') || name.includes('E.E') || name.includes('E.C') || name.includes('EO') || name.includes('EE') || name === 'ASAMBLEA 2025') {
      console.log(`\n--- Inspecting ${worksheet.name} ---`);
      
      // Print first 150 rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 150) {
          const values = [];
          row.eachCell((cell, colNumber) => {
            let val = cell.value;
            if (val && typeof val === 'string') {
              // Test normalization: capitalize, remove comma, fix spaces
              const normalized = val.toUpperCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
              values.push(`${colNumber}: ${val} [${normalized}]`);
            } else {
              values.push(`${colNumber}: ${val}`);
            }
          });
          console.log(`Row ${rowNumber}:`, values.join(' | '));
        }
      });
    }
  }
}

inspectSheet().catch(console.error);
