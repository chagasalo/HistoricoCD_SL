import axios from 'axios';
import ExcelJS from 'exceljs';

const SHEET_URL = process.env.SHEET_URL;

async function exploreResults() {
  console.log('Downloading Excel file...');
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  console.log('Parsing Excel file...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.getWorksheet('RESULTADOS');
  if (!ws) {
    console.error('❌ Error: Hoja RESULTADOS no encontrada.');
    return;
  }

  console.log('--- Hoja RESULTADOS ---');
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 100) { 
      const values = row.values.slice(1); // ExcelJS uses 1-based arrays, but slice(1) gets row[1...]
      if (values.some(v => v !== null && v !== undefined && v !== '')) {
         console.log(`Fila ${rowNumber}:`, JSON.stringify(values));
      }
    }
  });
}

exploreResults().catch(console.error);
