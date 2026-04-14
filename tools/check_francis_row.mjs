import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkFrancisRow() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const row = sheet.getRow(202);
    console.log("Row 202 (Cesar Francis) All Cols:");
    for (let c = 1; c <= 15; c++) {
        const cell = row.getCell(c);
        const fill = cell.fill ? JSON.stringify(cell.fill).substring(0, 50) : 'none';
        console.log(`Col ${c}: Val='${cell.value}' | Fill=${fill}`);
    }
}

checkFrancisRow();
