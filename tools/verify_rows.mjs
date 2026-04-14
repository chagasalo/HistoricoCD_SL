import ExcelJS from 'exceljs';
import axios from 'axios';

async function verifyRows12() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    
    for (let r = 1; r <= 3; r++) {
        const row = sheet.getRow(r);
        console.log(`--- Row ${r} ---`);
        for (let c = 1; c <= 15; c++) {
            const cell = row.getCell(c);
            console.log(`Col ${c}: ${cell.value}`);
        }
    }
}

verifyRows12();
