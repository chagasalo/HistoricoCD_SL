import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectSheet() {
    const url = process.env.SHEET_URL;
    console.log("Downloading...");
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    console.log("Rows 1-5:");
    for (let i = 1; i <= 5; i++) {
        const row = sheet.getRow(i);
        const vals = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const fillStr = cell.fill ? JSON.stringify(cell.fill).substring(0, 100) : 'none';
            vals.push(`[Col ${colNumber}]: ${cell.value} (Fill: ${fillStr})`);
        });
        console.log(`Row ${i}: ${vals.join(' | ')}`);
    }
}

inspectSheet();
