import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkAsambleistasColors() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row2 = sheet.getRow(2);
    let col2023 = -1;
    row2.eachCell(c => { if (c.value && c.value.toString().includes('2023')) col2023 = c.col; });
    console.log(`ASAMBLEISTAS 2023 Column: ${col2023}`);

    if (col2023 > 0) {
        let count = 0;
        sheet.eachRow((row, rowNumber) => {
            const cell = row.getCell(col2023);
            if (cell.fill && cell.fill.type !== 'none') {
                count++;
            }
        });
        console.log(`ASAMBLEISTAS 2023 color count: ${count}`);
    }
}

checkAsambleistasColors();
