import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkRow6Val() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row6 = sheet.getRow(6);
    console.log(`Row 6 Col 7: Val='${row6.getCell(7).value}' | Fill=${JSON.stringify(row6.getCell(7).fill)}`);
}

checkRow6Val();
