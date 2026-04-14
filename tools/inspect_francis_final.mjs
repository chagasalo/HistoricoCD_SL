import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectFrancisFix() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    
    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(1).value;
        if (name && name.toString().toUpperCase().includes('FRANCIS')) {
            const cell = row.getCell(11); // Col 11 is 2022/2023
            console.log(`Row ${rowNumber}: ${name} | Val: ${cell.value} | Fill: ${JSON.stringify(cell.fill)}`);
        }
    });

    // Also check col 12 and 13
    console.log("Checking Col 12 and 13 for Francis...");
    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(1).value;
        if (name && name.toString().toUpperCase().includes('FRANCIS')) {
            const cell12 = row.getCell(12);
            const cell13 = row.getCell(13);
            console.log(`Row ${rowNumber}: ${name} | Col 12: ${cell12.value} | Col 13: ${cell13.value}`);
        }
    });
}

inspectFrancisFix();
