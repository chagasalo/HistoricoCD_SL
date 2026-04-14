import ExcelJS from 'exceljs';
import axios from 'axios';

async function findTamer() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    console.log("Searching for TAMER...");

    workbook.worksheets.forEach(sheet => {
        sheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, col) => {
                if (cell.value && cell.value.toString().toUpperCase().includes('TAMER')) {
                    console.log(`Sheet: ${sheet.name} | R${rowNumber}C${col}: Val=${cell.value}`);
                }
            });
        });
    });
}

findTamer();
