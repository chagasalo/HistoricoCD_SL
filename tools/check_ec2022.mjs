import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkEC2022() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.C 2022');
    console.log("Headers in E.C 2022:");
    const row1 = sheet.getRow(1);
    row1.eachCell((c, col) => console.log(`Col ${col}: ${c.value}`));
}

checkEC2022();
