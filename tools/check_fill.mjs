import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAnyFill() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.O 2023');
    console.log("Checking for ANY fill in E.O 2023:");
    let found = 0;
    sheet.eachRow((row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.fill && cell.fill.type !== 'none') {
                found++;
                if (found < 10) {
                   console.log(`Fill at R${rowNumber}C${colNumber}: ${JSON.stringify(cell.fill).substring(0, 100)} (Val: ${cell.value})`);
                }
            }
        });
    });
    console.log(`Total filled cells: ${found}`);
}

checkAnyFill();
