import ExcelJS from 'exceljs';
import axios from 'axios';

async function verifyTamerStatus() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const row = sheet.getRow(489); // Tamer
    
    // Check Col 4 (2023) and Col 5 (2022)
    [4, 5].forEach(c => {
        const cell = row.getCell(c);
        console.log(`Col ${c}: Val='${cell.value}' | Fill=${JSON.stringify(cell.fill)}`);
    });
}

verifyTamerStatus();
