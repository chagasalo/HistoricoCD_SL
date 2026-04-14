import ExcelJS from 'exceljs';
import axios from 'axios';

async function check2019Asamblea() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row35 = sheet.getRow(35); // Alvarez, Adrian Horacio
    console.log(`Alvarez 2019 (Col 4): Val='${row35.getCell(4).value}' | Fill=${JSON.stringify(row35.getCell(4).fill).substring(0, 100)}`);
}

check2019Asamblea();
