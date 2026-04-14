import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkEE2026Colors() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.E 2026');
    if (!sheet) return console.log("No sheet E.E 2026");

    console.log("Checking for colors in E.E 2026:");
    let found = 0;
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.fill && cell.fill.type !== 'none') {
                found++;
                if (found < 5) console.log(`R${rowNumber}C${colNumber}: Val=${cell.value} | Fill=${JSON.stringify(cell.fill).substring(0, 100)}`);
            }
        });
    });
    console.log(`Total filled: ${found}`);
}

checkEE2026Colors();
