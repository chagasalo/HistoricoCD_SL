import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectEO2023() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.O 2023');
    if (!sheet) return console.log("No sheet E.O 2023");

    console.log("Rows in E.O 2023 with colors:");
    sheet.eachRow((row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.value && cell.fill && cell.fill.fgColor) {
                console.log(`Row ${rowNumber}, Col ${colNumber}: ${cell.value} | Fill: ${JSON.stringify(cell.fill)}`);
            }
        });
    });
}

inspectEO2023();
