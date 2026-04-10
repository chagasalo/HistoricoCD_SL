import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkHistoricalGreens() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const col2010 = 11; // Based on verify_rows output

    console.log("Sampling 2010 colors in ASAMBLEISTAS:");
    for (let i = 3; i <= 50; i++) {
        const row = sheet.getRow(i);
        const cell = row.getCell(col2010);
        if (cell.fill && cell.fill.type !== 'none') {
            console.log(`Row ${i} (${row.getCell(1).value}): Fill=${JSON.stringify(cell.fill).substring(0, 100)}`);
        }
    }
}

checkHistoricalGreens();
