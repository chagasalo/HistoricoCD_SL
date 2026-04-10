import ExcelJS from 'exceljs';
import axios from 'axios';

async function check2016Colors() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const col2016 = 5; 

    console.log("Sampling 2016 colors in ASAMBLEISTAS (Col 5):");
    let count = 0;
    sheet.eachRow((row, rowNumber) => {
        const cell = row.getCell(col2016);
        if (cell.fill && cell.fill.type !== 'none') {
            count++;
            if (count < 10) {
               console.log(`Row ${rowNumber} (${row.getCell(1).value}): Fill=${JSON.stringify(cell.fill)}`);
            }
        }
    });
    console.log(`Total colored rows in 2016: ${count}`);
}

check2016Colors();
