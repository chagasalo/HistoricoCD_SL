import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectEO2023() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('EO 2023');
    if (!sheet) return console.log("No sheet EO 2023");

    console.log("Rows 1-20 in EO 2023:");
    for (let i = 1; i <= 20; i++) {
        const row = sheet.getRow(i);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.value) {
                const fill = cell.fill ? JSON.stringify(cell.fill).substring(0, 100) : 'none';
                console.log(`Row ${i}, Col ${colNumber}: ${cell.value} | Fill: ${fill}`);
            }
        });
    }
}

inspectEO2023();
