import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAgrupaciones() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('AGRUPACIONES');
    if (!sheet) return console.log("No sheet AGRUPACIONES");

    console.log("Rows 1-20 in AGRUPACIONES:");
    sheet.eachRow((row, rowNumber) => {
        const vals = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            vals.push(`[Col ${colNumber}]: ${cell.value}`);
        });
        console.log(`Row ${rowNumber}: ${vals.join(' | ')}`);
    });
}

checkAgrupaciones();
