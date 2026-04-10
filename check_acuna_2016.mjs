import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAcuña2016() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row6 = sheet.getRow(6);
    console.log(`Acuña 2016 (Col 5): Val='${row6.getCell(5).value}' | Fill=${JSON.stringify(row6.getCell(5).fill).substring(0, 100)}`);
}

checkAcuña2016();
