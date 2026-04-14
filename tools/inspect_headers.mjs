import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectFinalCols() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const headerRow = sheet.getRow(1);
    console.log("All Headers in CANDIDATOS A CD:");
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        console.log(`[Col ${colNumber}]: ${cell.value}`);
    });
}

inspectFinalCols();
