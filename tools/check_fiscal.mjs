import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkFiscalizadora() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('FISCALIZADORA');
    if (!sheet) return console.log("No sheet FISCALIZADORA");

    const row = sheet.getRow(1);
    console.log("Headers in FISCALIZADORA Row 1:");
    row.eachCell((c, col) => console.log(`Col ${col}: ${c.value}`));
    
    const row2 = sheet.getRow(2);
    console.log("Headers in FISCALIZADORA Row 2:");
    row2.eachCell((c, col) => console.log(`Col ${col}: ${c.value}`));
}

checkFiscalizadora();
