import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkValuesInEO() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheets = ['E.O 2023', 'E.E 2026', 'ASAMBLEA 2025'];
    sheets.forEach(s => {
        const sheet = workbook.getWorksheet(s);
        if (!sheet) return;
        console.log(`--- Checking values in ${s} ---`);
        sheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                const val = cell.value?.toString().toLowerCase().trim();
                if (val === 'si' || val === 'x') {
                    console.log(`R${rowNumber}C${colNumber}: ${cell.value}`);
                }
            });
        });
    });
}

checkValuesInEO();
