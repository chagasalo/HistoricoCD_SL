import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkMorettiStatus() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const morettiRow = sheet.getRow(352); // Moretti
    const col4 = morettiRow.getCell(4); // 2023
    console.log(`Moretti 2023 (Col 4): Val='${col4.value}' | Fill=${JSON.stringify(col4.fill)}`);
}

checkMorettiStatus();
