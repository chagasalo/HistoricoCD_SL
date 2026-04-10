import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAsambleistasCols() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row2 = sheet.getRow(2);
    console.log("Headers in ASAMBLEISTAS Row 2:");
    for (let c = 1; c <= 20; c++) {
        console.log(`Col ${c}: ${row2.getCell(c).value}`);
    }
}

checkAsambleistasCols();
