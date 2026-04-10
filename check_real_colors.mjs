import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkRealColors() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.E 2026');
    console.log("Searching for ARGB or Theme colors in E.E 2026...");
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
           const fg = cell.fill?.fgColor;
           if (fg && (fg.argb || fg.theme !== undefined)) {
              console.log(`R${rowNumber}C${colNumber}: Val=${cell.value} | ARGB=${fg.argb} | Theme=${fg.theme}`);
           }
        });
    });
}

checkRealColors();
