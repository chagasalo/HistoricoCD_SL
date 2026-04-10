import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAsamblea2025() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEA 2025');
    if (!sheet) return console.log("No sheet ASAMBLEA 2025");

    console.log("Searching for colors in ASAMBLEA 2025...");
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
           const fg = cell.fill?.fgColor;
           if (fg && (fg.argb && fg.argb !== 'FFFFFFFF')) {
              console.log(`R${rowNumber}C${colNumber}: Val=${cell.value} | ARGB=${fg.argb}`);
           }
        });
    });
}

checkAsamblea2025();
