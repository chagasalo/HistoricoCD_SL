import ExcelJS from 'exceljs';
import axios from 'axios';

async function findMoretti() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(1).value;
        if (name && name.toString().toUpperCase().includes('MORETTI')) {
            console.log(`Moretti at R${rowNumber}: ${name} | Col 2 (2026): ${row.getCell(2).value} | Fill: ${JSON.stringify(row.getCell(2).fill)?.substring(0, 100)}`);
            console.log(`Moretti at R${rowNumber}: Col 3 (2025): ${row.getCell(3).value}`);
            console.log(`Moretti at R${rowNumber}: Col 4 (2023): ${row.getCell(4).value}`);
        }
    });
}

findMoretti();
