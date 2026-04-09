import axios from 'axios';
import ExcelJS from 'exceljs';
import fs from 'fs';

const SHEET_URL = process.env.SHEET_URL;
if (!SHEET_URL) {
  console.error('❌ Error: SHEET_URL no encontrada en las variables de entorno.');
  process.exit(1);
}

const OUT_FILE = './public/data.json';

function smartNormalize(name) {
  if (!name) return '';
  return name.toString()
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/,/g, '')
    .replace(/\./g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .sort()
    .join(' ');
}

function normalizeListName(list) {
  if (!list) return 'Independiente';
  let name = list.toString().trim();
  const lower = name.toLowerCase();
  
  if (lower.includes('boedo en accion')) return 'Boedo en Accion';
  if (lower.includes('cruzada')) return 'Cruzada x SL';
  if (lower.includes('siglo xxi') || lower.includes('sixlo xxi')) return 'SL Siglo XXI';
  if (lower.includes('mas sl')) return 'MAS SL';
  if (lower.includes('volver a sl')) return 'Volver a SL';
  if (lower.includes('x amor a sl')) return 'X Amor a SL';
  if (lower.includes('nuevo san lorenzo') || lower === 'nuevo sl') return 'Nuevo SL';
  if (lower.includes('vamos san lorenzo') || lower === 'vamos sl') return 'Vamos SL';
  if (lower.includes('grandeza azulgrana')) return 'Grandeza Azulgrana';
  if (lower.includes('orden y progreso')) return 'Orden y Progreso';

  return name;
}

async function fetchAndParse() {
  console.log('Downloading Excel file...');
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  console.log('Parsing Excel file...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const electionPositions = {}; 
  const dataMap = new Map();

  // PASS 1: EO/EE sheets
  console.log('Scanning EO/EE sheets...');
  workbook.worksheets.forEach(worksheet => {
    const sheetName = worksheet.name.toUpperCase();
    if (sheetName.includes('E.O') || sheetName.includes('E.E') || sheetName.includes('E.C') || 
        sheetName.includes('EO') || sheetName.includes('EE') || sheetName.includes('ASAMBLEA 2025')) {
      const yearMatch = sheetName.match(/\d{4}/);
      if (!yearMatch) return;
      let year = yearMatch[0];
      
      // Special mapping for 2012 cases
      if (sheetName.includes('E.E 2012') || sheetName.includes('EE 2012')) year = '2012 (Extraordinaria)';
      if (sheetName.includes('A.E 2012') || sheetName.includes('AE 2012')) year = '2012 (Asamblea)';

      if (!electionPositions[year]) electionPositions[year] = {
        "Comisión Directiva": [], "Asamblea": [], "Fiscalizadora": []
      };

      let currentSection = "Comisión Directiva";
      let listHeaders = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell, colNumber) => {
              if (cell.value) listHeaders[colNumber] = cell.value.toString().trim();
          });
          return;
        }

        const firstCell = row.getCell(2).value?.toString().toUpperCase() || '';
        if (firstCell.includes('ASAMBLEA')) { currentSection = "Asamblea"; return; }
        if (firstCell.includes('FISCALIZADORA')) { currentSection = "Fiscalizadora"; return; }

        for (let col = 2; col <= worksheet.columnCount; col += 3) {
           const positionCell = row.getCell(col);
           const nameCell = row.getCell(col + 1);
           
           if (positionCell.value && nameCell.value) {
             const position = positionCell.value.toString().trim();
             const rawName = nameCell.value.toString().trim();
             if (!rawName) continue;
             const normName = smartNormalize(rawName);
             
             if (currentSection === "Comisión Directiva" && /^\d+$/.test(position) && rowNumber > 20) {
               currentSection = "Asamblea";
             }

             electionPositions[year][currentSection].push({ normalized: normName, position });

             const candidateKey = smartNormalize(rawName);
             if (!dataMap.has(candidateKey)) dataMap.set(candidateKey, { name: rawName, history: [] });
             const record = dataMap.get(candidateKey);
             
             const listName = normalizeListName(listHeaders[col] || listHeaders[col-1]);
             if (!record.history.some(h => h.year === year && h.category === currentSection)) {
                record.history.push({
                   year, list: listName, elected: false, category: currentSection, position
                });
             }
           }
        }
      });
    }
  });

  function findCargo(year, rawName, category = "Comisión Directiva") {
    if (!year || !rawName) return null;
    const cleanYear = year.toString().match(/\d{4}(\s*\([^)]+\))?/)?.[0];
    if (!cleanYear || !electionPositions[cleanYear]) return null;
    const sectionsToSearch = electionPositions[cleanYear][category] ? [category] : Object.keys(electionPositions[cleanYear]);
    const targetWords = smartNormalize(rawName).split(' ').filter(w => w.length > 0);
    if (targetWords.length === 0) return null;
    for (const section of sectionsToSearch) {
      for (const entry of electionPositions[cleanYear][section]) {
        const entryWords = entry.normalized.split(' ');
        if (entryWords.every(w => targetWords.includes(w)) || targetWords.every(w => entryWords.includes(w))) return entry.position;
      }
    }
    return null;
  }

  // PASS 2: Summary sheets
  workbook.worksheets.forEach((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();
    let category = '';
    if (sheetName.includes('FISCALIZADORA')) category = 'Fiscalizadora';
    else if (sheetName.includes('ASAMBLEISTAS')) category = 'Asamblea';
    else if (sheetName.includes('CANDIDATOS A CD') || sheetName === 'CD') category = 'Comisión Directiva';
    
    if (!category) return;
    console.log(`Processing summary: "${worksheet.name}"...`);

    let headers = [];
    let nameCol = -1;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 2) {
        row.eachCell((cell, colNumber) => { 
          const val = cell.value?.toString().toUpperCase() || '';
          headers[colNumber] = val;
          if (val.includes('CANDIDATO') || val.includes('NOMBRE') || val.includes('INTEGRANTE')) nameCol = colNumber;
        });
        return;
      }
      if (rowNumber < 3 || nameCol === -1) return;

      const candidateName = row.getCell(nameCol).value?.toString().trim();
      if (!candidateName) return;

      const candidateKey = smartNormalize(candidateName);
      if (!dataMap.has(candidateKey)) dataMap.set(candidateKey, { name: candidateName, history: [] });
      const record = dataMap.get(candidateKey);

      let listCol = headers.indexOf('AGRUPACION');
      if (listCol === -1) listCol = headers.indexOf('LISTA');
      const globalListName = normalizeListName(listCol > 0 ? row.getCell(listCol).value : 'Independiente');

      headers.forEach((headerValue, colNumber) => {
        if (colNumber === nameCol) return;
        const yearMatch = headerValue?.toString().match(/\d{4}(\s*\([^)]+\))?/);
        if (!yearMatch) return;
        const year = yearMatch[0].trim();

        const cell = row.getCell(colNumber);
        const val = cell.value?.toString().trim() || '';
        const isGreen = cell.fill?.fgColor?.argb === 'FF00FF00' || cell.fill?.fgColor?.theme === 6;
        const isElected = val.toLowerCase() === 'x' || val.toLowerCase() === 'si' || isGreen;

        if (isElected || val.length > 2) {
           const rawList = (val.length > 3 && !['si', 'no', 'x'].includes(val.toLowerCase())) ? val : globalListName;
           const listName = normalizeListName(rawList);
           
           let hist = record.history.find(h => h.year === year && h.category === category);
           if (!hist) {
             hist = { year, list: listName, elected: isElected, category, position: findCargo(year, candidateName, category) };
             record.history.push(hist);
           } else {
             hist.elected = isElected;
             if (listName) hist.list = listName;
             if (!hist.position) hist.position = findCargo(year, candidateName, category);
           }
        }
      });
    });
  });

  const data = Array.from(dataMap.values()).filter(c => c.history.length > 0);
  console.log(`Parsed ${data.length} candidates. Saving...`);
  fs.writeFileSync(OUT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), candidates: data }, null, 2));
}

fetchAndParse().catch(err => { console.error('Error:', err); });
