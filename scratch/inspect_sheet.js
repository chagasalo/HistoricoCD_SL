import axios from 'axios';
import ExcelJS from 'exceljs';
import fs from 'fs';

const SHEET_URL = process.env.SHEET_URL;
if (!SHEET_URL) {
  console.error('❌ Error: SHEET_URL no encontrada en las variables de entorno.');
  process.exit(1);
}

async function run() {
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.getWorksheet('RESULTADOS');
  if (!ws) {
    console.error('No se encontró la hoja RESULTADOS');
    return;
  }

  let output = '';
  ws.eachRow((row, rowNumber) => {
    if (rowNumber > 80) return;
    const vals = [];
    for (let c = 1; c <= 15; c++) {
      const val = row.getCell(c).value;
      let printVal = '';
      if (val === null || val === undefined) {
        printVal = '';
      } else if (typeof val === 'object' && val.result !== undefined) {
        printVal = `{FormulaResult: ${val.result}}`;
      } else if (typeof val === 'object') {
        printVal = JSON.stringify(val);
      } else {
        printVal = val.toString();
      }
      vals.push(`[Col ${c}: ${printVal}]`);
    }
    output += `Row ${rowNumber}: ${vals.join(' | ')}\n`;
  });

  fs.writeFileSync('./scratch/resultados_dump.txt', output, 'utf8');
  console.log('Inspección guardada en ./scratch/resultados_dump.txt');
}

run().catch(console.error);
