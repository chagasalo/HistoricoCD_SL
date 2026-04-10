import ExcelJS from 'exceljs';
import axios from 'axios';

async function listSheets() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    console.log("Worksheets:");
    workbook.worksheets.forEach(ws => console.log(`- ${ws.name}`));
}

listSheets();
