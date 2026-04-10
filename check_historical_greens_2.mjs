import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkHistoricalGreensCorrected() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const col2010 = 7; 

    console.log("Sampling 2010 colors in ASAMBLEISTAS (Col 7):");
    let count = 0;
    sheet.eachRow((row, rowNumber) => {
        const cell = row.getCell(col2010);
        if (cell.fill && cell.fill.type !== 'none') {
            count++;
            if (count < 10) {
               console.log(`Row ${rowNumber} (${row.getCell(1).value}): Fill=${JSON.stringify(cell.fill)}`);
            }
        }
    });
    console.log(`Total colored rows in 2010: ${count}`);
}

checkHistoricalGreensCorrected();
