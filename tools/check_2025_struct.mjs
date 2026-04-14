import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAsamblea2025Structure() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEA 2025');
    if (!sheet) return console.log("No sheet ASAMBLEA 2025");

    console.log("Rows 1-10 in ASAMBLEA 2025:");
    sheet.eachRow((row, rowNumber) => {
        const vals = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            vals.push(`[Col ${colNumber}]: ${cell.value}`);
        });
        console.log(`Row ${rowNumber}: ${vals.join(' | ')}`);
        if (rowNumber >= 10) return;
    });
}

checkAsamblea2025Structure();
