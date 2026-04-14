import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAsambleistasSample() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    for (let i = 2; i <= 30; i++) {
        const row = sheet.getRow(i);
        const cell = row.getCell(2); // 2023
        const fill = cell.fill ? JSON.stringify(cell.fill).substring(0, 80) : 'none';
        console.log(`Row ${i} (${row.getCell(1).value}): Val='${cell.value}' | Fill=${fill}`);
    }
}

checkAsambleistasSample();
