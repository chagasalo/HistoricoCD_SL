import ExcelJS from 'exceljs';
import axios from 'axios';

async function findCesarInEO() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('E.O 2023');
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value && cell.value.toString().toUpperCase().includes('FRANCIS')) {
                console.log(`Cesar Francis at R${rowNumber}C${colNumber}: ${cell.value} | Fill: ${JSON.stringify(cell.fill)}`);
            }
        });
    });
}

findCesarInEO();
