import ExcelJS from 'exceljs';
import axios from 'axios';

async function finalMatrixCheck() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const headerRow = sheet.getRow(1);
    const abdoRow = sheet.getRow(4);

    console.log("Full Row 1 & 4 comparison:");
    for (let c = 1; c <= 20; c++) {
        const h = headerRow.getCell(c).value;
        const v = abdoRow.getCell(c).value;
        const f = abdoRow.getCell(c).fill ? JSON.stringify(abdoRow.getCell(c).fill).substring(0, 50) : 'none';
        console.log(`Col ${c}: Header='${h}' | Val='${v}' | Fill=${f}`);
    }
}

finalMatrixCheck();
