import ExcelJS from 'exceljs';
import axios from 'axios';
import fs from 'fs';

async function inspectColors() {
    const url = process.env.SHEET_URL;
    if (!url) return console.error("No SHEET_URL");

    console.log("Downloading...");
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    if (!sheet) return console.error("No sheet CANDIDATOS A CD");

    console.log("--- Color Inspection (CANDIDATOS A CD) ---");
    // Sample a few rows and columns (e.g. columns with years)
    const headerRow = sheet.getRow(1);
    const cols = [];
    headerRow.eachCell(cell => {
      if (cell.value && cell.value.toString().match(/\d{4}/)) {
        cols.push(cell.col);
      }
    });

    for (let r = 2; r <= 20; r++) {
      const row = sheet.getRow(r);
      const name = row.getCell(1).value;
      if (!name) continue;

      cols.forEach(c => {
        const cell = row.getCell(c);
        if (cell.value) {
          const fg = cell.fill?.fgColor;
          console.log(`Row ${r}, Col ${c} (${headerRow.getCell(c).value}): Value='${cell.value}', Color=${JSON.stringify(fg)}`);
        }
      });
    }
}

inspectColors();
