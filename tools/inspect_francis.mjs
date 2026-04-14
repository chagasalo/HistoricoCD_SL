import ExcelJS from 'exceljs';
import axios from 'axios';

async function inspectFrancis() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    const headerRow = sheet.getRow(1);
    let col2023 = -1;
    headerRow.eachCell(c => { if (c.value && c.value.toString().includes('2023')) col2023 = c.col; });

    console.log(`Column for 2023: ${col2023}`);

    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(1).value;
        if (name && name.toString().includes('FRANCIS')) {
            const cell = row.getCell(col2023);
            console.log(`Row ${rowNumber}: ${name} | Val: ${cell.value} | Fill: ${JSON.stringify(cell.fill)}`);
        }
    });

    // Also check other opositors who should be elected
    const opositors = ['BOEDO EN ACCION', 'ORDEN Y PROGRESO', 'VOLVER A SAN LORENZO'];
    sheet.eachRow((row, rowNumber) => {
        const cell = row.getCell(col2023);
        if (cell.value && opositors.includes(cell.value.toString().toUpperCase())) {
            const name = row.getCell(1).value;
            if (cell.fill && cell.fill.fgColor) {
               console.log(`Opositor at Row ${rowNumber}: ${name} | Val: ${cell.value} | Fill: ${JSON.stringify(cell.fill)}`);
            }
        }
    });
}

inspectFrancis();
