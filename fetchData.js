import axios from 'axios';
import ExcelJS from 'exceljs';
import fs from 'fs';

const SHEET_URL = process.env.SHEET_URL;
if (!SHEET_URL) {
  console.error('❌ Error: SHEET_URL no encontrada en las variables de entorno.');
  console.error('Asegúrate de configurarla en el Panel de Vercel (Settings > Environment Variables).');
  process.exit(1);
}

const OUT_FILE = './public/data.json';

async function fetchAndParse() {
  console.log('Downloading Excel file...');
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  console.log('Parsing Excel file...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const dataMap = new Map();

  console.log('Sheets found:', workbook.worksheets.map(w => w.name));

  // Iterate through all worksheets
  workbook.worksheets.forEach((worksheet, sheetIndex) => {
    const sheetName = worksheet.name.toUpperCase();
    let category = 'Comisión Directiva'; // Default
    
    if (sheetName.includes('FISCALIZADORA')) {
      category = 'Fiscalizadora';
    } else if (sheetName.includes('ASAMBLEISTAS') || sheetName.includes('ASAMBLEA')) {
      category = 'Asamblea';
    } else if (sheetName.includes('CANDIDATOS A CD') || sheetName === 'CD') {
      category = 'Comisión Directiva';
    } else if (sheetIndex === 0) {
      // Fallback for the first sheet if it doesn't match the names above
      category = 'Comisión Directiva';
    } else {
      // If it's another sheet and we don't recognize it, skip
      console.log(`Skipping sheet: ${worksheet.name} (not a recognized category)`);
      return; 
    }

    console.log(`Processing sheet: "${worksheet.name}" mapped to category: "${category}"`);

    let headers = [];
    worksheet.eachRow((row, rowNumber) => {
      // Row 2 contains headers
      if (rowNumber === 2) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value ? cell.value.toString().trim() : `Col_${colNumber}`;
        });
        return;
      }

      if (rowNumber < 2 || !headers.length) return;

      const rawCandidateName = row.getCell(1).value;
      if (!rawCandidateName) return;

      // Normalizing name (Upper case, remove excessive spaces)
      const candidateName = rawCandidateName.toString().trim().toUpperCase().replace(/\s+/g, ' ');

      if (!dataMap.has(candidateName)) {
        dataMap.set(candidateName, {
          name: candidateName,
          history: []
        });
      }

      const candidateRecord = dataMap.get(candidateName);

      // Iterate through columns (years), starting from col 2
      for (let col = 2; col <= headers.length; col++) {
        const cell = row.getCell(col);
        const year = headers[col];
        let listName = cell.value ? cell.value.toString().trim() : null;
        
        if (listName && listName !== '2004') { // Ignore 2004 as requested
          
          // Normalize list names (ETL)
          const lowerList = listName.toLowerCase();
          if (lowerList === 'boedo en accion') listName = 'Boedo en Accion';
          else if (lowerList === 'cruzada x sl') listName = 'Cruzada x SL';
          else if (lowerList === 'sl sixlo xxi' || lowerList === 'sl siglo xxi') listName = 'SL Siglo XXI';
          else if (lowerList === 'mas sl') listName = 'MAS SL';
          else if (lowerList === 'volver a sl') listName = 'Volver a SL';
          else if (lowerList === 'x amor a sl') listName = 'X Amor a SL';

          let isElected = false;
          if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor) {
             const argb = cell.fill.fgColor.argb;
             if (argb && argb.toUpperCase() === 'FF00FF00') {
               isElected = true;
             }
          }
          
          // Prevent duplicate history entries for same year/list/category within the same candidate
          const routeExists = candidateRecord.history.some(h => h.year === year && h.list === listName && h.category === category);
          if (!routeExists) {
              candidateRecord.history.push({
                 year,
                 list: listName,
                 elected: isElected,
                 category: category
              });
          }
        }
      }
    });
  });

  const data = Array.from(dataMap.values()).filter(c => c.history.length > 0);

  const outputObject = {
    updatedAt: new Date().toISOString(),
    candidates: data
  };

  console.log(`Parsed ${data.length} unique candidates. Saving to ${OUT_FILE}...`);
  fs.writeFileSync(OUT_FILE, JSON.stringify(outputObject, null, 2));
  console.log('Done!');
}

fetchAndParse().catch(err => {
  console.error('Error fetching data:', err);
});
