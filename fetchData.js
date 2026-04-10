import axios from 'axios';
import ExcelJS from 'exceljs';
import fs from 'fs';

const SHEET_URL = process.env.SHEET_URL;
if (!SHEET_URL) {
  console.error('❌ Error: SHEET_URL no encontrada en las variables de entorno.');
  process.exit(1);
}

const OUT_JSON = './public/data.json';
const OUT_CSV_CANDIDATES = './public/candidates.csv';
const OUT_CSV_HISTORY = './public/history.csv';
const OUT_CSV_AGRUPACIONES = './public/agrupaciones.csv';

// Load aliases
let aliases = {};
try {
  const aliasData = fs.readFileSync('./aliases.json', 'utf8');
  aliases = JSON.parse(aliasData);
} catch (e) {
  console.warn('No se encontró aliases.json o no es válido, se asumirá vacío.');
}

function normalizeAlias(name) {
  const norm = name.toUpperCase().replace(/\s+/g, ' ').trim();
  return aliases[norm] || norm;
}

function smartNormalize(name) {
  if (!name) return '';
  const aliasResolved = normalizeAlias(name);
  return aliasResolved.toString()
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
  if (!list) return '';
  let name = list.toString().trim();
  if (name.toLowerCase() === 'independiente') return '';
  
  // Normalización base: minúsculas, cambio de 'x' por 'por', expandir SL e ignorar espacios dobles
  let clean = name.toLowerCase()
    .replace(/\s+x\s+/g, ' por ')
    .replace(/\bsl\b/g, 'san lorenzo')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Mapeos definitivos (fuente de verdad)
  if (clean.includes('boedo en accion') || clean.includes('boedo accion')) return 'Boedo en Accion';
  if (clean.includes('cruzada')) return 'Cruzada por San Lorenzo';
  if (clean.includes('siglo xxi') || clean.includes('sixlo xxi')) return 'San Lorenzo Siglo XXI';
  if (clean.includes('mas san lorenzo')) return 'Mas San Lorenzo';
  if (clean.includes('volver a san lorenzo')) return 'Volver a San Lorenzo';
  if (clean.includes('x amor a san lorenzo') || clean.includes('amor a san lorenzo')) return 'X Amor a San Lorenzo';
  if (clean.includes('nuevo san lorenzo')) return 'Nuevo San Lorenzo';
  if (clean.includes('vamos san lorenzo')) return 'Vamos San Lorenzo';
  if (clean.includes('grandeza azulgrana')) return 'Grandeza Azulgrana';
  if (clean.includes('orden y progreso')) return 'Orden y Progreso';
  if (clean.includes('somos san lorenzo')) return 'Somos San Lorenzo';
  if (clean.includes('rumbo san lorenzo') || clean.includes('rumbo san lorencista')) return 'Nuevo Rumbo San Lorencista';
  if (clean.includes('dignidad por san lorenzo')) return 'Dignidad por San Lorenzo';
  if (clean.includes('san lorenzo para todos')) return 'San Lorenzo para Todos';
  if (clean.includes('unidos por san lorenzo')) return 'Unidos por San Lorenzo';
  if (clean.includes('revolucion azulgrana') || clean.includes('rev. azulgrana')) return 'Revolucion Azulgrana';
  if (clean.includes('prog. azulgrana') || clean.includes('proyecto azulgrana')) return 'Proyecto Azulgrana';

  // Si no hay mapeo, aplicar Capitalización de Título genérica
  return clean.split(' ').map((word, index) => {
    // Si es la primera palabra, siempre capitalizar. Si no, ignorar conectores comunes.
    if (index > 0 && ['de', 'y', 'por', 'en', 'la', 'el', 'a', 'para', 'con', 'del', 'x'].includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

// Analizador de metadatos de renuncias
function analyzeMetadata(bioText) {
  const meta = {
    hasResigned: false,
    remarks: []
  };
  if (!bioText) return meta;
  
  const text = bioText.toLowerCase();
  if (text.includes('renuncia') || text.includes('renunció')) {
    meta.hasResigned = true;
    meta.remarks.push('Renuncia / Fin de mandato anticipado');
  }
  if (text.includes('fallecimiento') || text.includes('falleció')) {
    meta.hasResigned = true;
    meta.remarks.push('Fallecimiento');
  }
  return meta;
}

// Generador CSV Helper
function writeCSV(filename, headers, rows) {
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const content = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
  
  fs.writeFileSync(filename, content, 'utf8');
}

async function fetchAndParse() {
  console.log('Downloading Excel file...');
  const response = await axios.get(SHEET_URL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  console.log('Parsing Excel file...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // Bases de Domicilio
  const agrupacionesData = new Map(); // Name -> Description
  const biografiasData = new Map(); // CandidateKey -> { text, meta }
  
  // Fase 1 & 2: Extraer Biografías y Agrupaciones
  const wsAgrup = workbook.getWorksheet('AGRUPACIONES');
  if (wsAgrup) {
     wsAgrup.eachRow((row, rowNumber) => {
        if (rowNumber < 2) return;
        const nombre = row.getCell(2).value?.toString().trim();
        const desc = row.getCell(3).value?.toString().trim();
        if (nombre && desc) agrupacionesData.set(normalizeListName(nombre), desc);
     });
  }

  const wsBio = workbook.getWorksheet('Biografias');
  if (wsBio) {
     wsBio.eachRow((row, rowNumber) => {
        if (rowNumber < 2) return;
        const candidateName = row.getCell(2).value?.toString().trim();
        const bioText = row.getCell(3).value?.toString().trim();
        
        if (candidateName && bioText) {
          const key = smartNormalize(candidateName);
          biografiasData.set(key, {
            text: bioText,
            meta: analyzeMetadata(bioText)
          });
        }
     });
  }

  const electionPositions = {}; 
  const dataMap = new Map();

  // Fase 3: Escanear hojas EO/EE para encontrar posiciones
  console.log('Scanning EO/EE/AE sheets for positions...');
  workbook.worksheets.forEach(worksheet => {
    const sheetName = worksheet.name.toUpperCase();
    if (sheetName.includes('E.O') || sheetName.includes('E.E') || sheetName.includes('E.C') || 
        sheetName.includes('EO') || sheetName.includes('EE') || sheetName.includes('ASAMBLEA 2025') ||
        sheetName.includes('A.E')) {
      
      const yearMatch = sheetName.match(/\d{4}/);
      if (!yearMatch) return;
      let year = yearMatch[0];
      
      // Mapeo especial para 2012
      if (sheetName.includes('E.E 2012') || sheetName.includes('EE 2012')) year = '2012 (Extraordinaria)';
      if (sheetName.includes('A.E 2012') || sheetName.includes('AE 2012')) year = '2012 (Asamblea)';

      if (!electionPositions[year]) electionPositions[year] = {
        "Comisión Directiva": [], "Asamblea": [], "Fiscalizadora": []
      };

      let currentSection = "Comisión Directiva";
      let listHeaders = [];
      const columnLayouts = []; // Array of { colIndex, listName }

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell, colNumber) => {
              if (cell.value) listHeaders[colNumber] = cell.value.toString().trim();
          });
          return;
        }

        // En la fila 2 detectamos el layout de columnas
        if (rowNumber === 2) {
           for (let col = 2; col <= worksheet.columnCount; col++) {
              const cellVal = row.getCell(col).value?.toString().toUpperCase() || '';
              // Si la celda es un cargo (no un nombre), marcamos el inicio de un bloque
              if (cellVal.includes('PRESIDENTE') || cellVal.includes('VOCAL') || cellVal.includes('SECRETARIO') || cellVal.includes('TESORERO')) {
                 const listName = normalizeListName(listHeaders[col] || listHeaders[col-1] || listHeaders[col+1]);
                 if (listName) {
                    columnLayouts.push({ col, list: listName });
                 }
              }
           }
           return;
        }

        const firstCell = row.getCell(2).value?.toString().toUpperCase() || '';
        if (firstCell.includes('ASAMBLEA')) { currentSection = "Asamblea"; return; }
        if (firstCell.includes('FISCALIZADORA')) { currentSection = "Fiscalizadora"; return; }

        columnLayouts.forEach(layout => {
           const col = layout.col;
           const positionCell = row.getCell(col);
           const nameCell = row.getCell(col + 1);
           
           if (positionCell.value && nameCell.value) {
             const position = positionCell.value.toString().trim();
             const rawName = normalizeAlias(nameCell.value.toString().trim());
             if (!rawName) return;
             
             // Evitar nombres de cargos que se filtran como nombres de personas
             if (position.toUpperCase() === rawName.toUpperCase()) return;

             const normName = smartNormalize(rawName);
             
             // Ignorar headers estructurales incrustados
             if (normName === 'ASAMBLEA DE REPRESENTANTES' || normName === 'COMISION FISCALIZADORA' || rawName.includes('*RENUNCIARON')) return;
             if (smartNormalize(position) === normName) return;
             
             if (currentSection === "Comisión Directiva" && /^\d+$/.test(position) && rowNumber > 20) {
               currentSection = "Asamblea";
             }

             electionPositions[year][currentSection].push({ normalized: normName, position });

             const candidateKey = normName;
             if (!dataMap.has(candidateKey)) dataMap.set(candidateKey, { name: rawName, history: [] });
             const record = dataMap.get(candidateKey);
             
             const listName = layout.list;
             if (!record.history.some(h => h.year === year && h.category === currentSection)) {
                record.history.push({
                   year, list: listName, elected: false, category: currentSection, position
                });
             }
           }
        });
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

  // Fase 4: Búsqueda de Cruces Electorales
  workbook.worksheets.forEach((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();
    let category = '';
    if (sheetName.includes('FISCALIZADORA')) category = 'Fiscalizadora';
    else if (sheetName.includes('ASAMBLEISTAS')) category = 'Asamblea';
    else if (sheetName.includes('CANDIDATOS A CD') || sheetName === 'CD') category = 'Comisión Directiva';
    
    if (!category) return;
    console.log(`Processing main matrix: "${worksheet.name}"...`);

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

      const candidateNameRaw = row.getCell(nameCol).value?.toString().trim();
      if (!candidateNameRaw) return;
      const candidateName = normalizeAlias(candidateNameRaw);

      const candidateKey = smartNormalize(candidateName);
      if (!dataMap.has(candidateKey)) dataMap.set(candidateKey, { name: candidateName, history: [] });
      const record = dataMap.get(candidateKey);

      let listCol = headers.indexOf('AGRUPACION');
      if (listCol === -1) listCol = headers.indexOf('LISTA');
      const globalListName = normalizeListName(listCol > 0 ? row.getCell(listCol).value : '');

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
           
           if (!listName) return; // Si no hay agrupación, no lo procesamos según requerimiento (evita 'Independiente')

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

  // Fase 5: Consolidación y Generación de Archivos
  const data = Array.from(dataMap.values())
     .filter(c => c.history.length > 0)
     .map(c => {
        const bioData = biografiasData.get(smartNormalize(c.name));
        return {
           name: c.name,
           history: c.history,
           biography: bioData ? bioData.text : null,
           status: bioData ? bioData.meta : { hasResigned: false, remarks: [] }
        };
     });

  console.log(`Parsed ${data.length} consolidated candidates. Generando archivos...`);

  // Escribir JSON App
  fs.writeFileSync(OUT_JSON, JSON.stringify({ updatedAt: new Date().toISOString(), candidates: data }, null, 2));

  // CSV de Candidatos
  const candidatesCSVHeaders = ["ID_Candidato", "Nombre", "Biografia", "Tiene_Renuncia", "Observaciones"];
  const candidatesCSVRows = data.map(c => [
     smartNormalize(c.name), c.name, c.biography || '', c.status.hasResigned ? 'SI' : 'NO', c.status.remarks.join(' - ')
  ]);
  writeCSV(OUT_CSV_CANDIDATES, candidatesCSVHeaders, candidatesCSVRows);

  // CSV de Historial
  const historyCSVHeaders = ["ID_Candidato", "Nombre", "Año", "Agrupacion", "Categoria", "Cargo", "Electo"];
  const historyCSVRows = [];
  data.forEach(c => {
     const id = smartNormalize(c.name);
     c.history.forEach(h => {
        historyCSVRows.push([
           id, c.name, h.year, h.list, h.category, h.position || '', h.elected ? 'SI' : 'NO'
        ]);
     });
  });
  writeCSV(OUT_CSV_HISTORY, historyCSVHeaders, historyCSVRows);

  // CSV de Agrupaciones
  const agrupacionesCSVHeaders = ["Agrupacion", "Reseña"];
  const agrupacionesCSVRows = Array.from(agrupacionesData.keys()).map(nombre => [
     nombre, agrupacionesData.get(nombre)
  ]);
  writeCSV(OUT_CSV_AGRUPACIONES, agrupacionesCSVHeaders, agrupacionesCSVRows);

  console.log('Exito! Generados: data.json, candidates.csv, history.csv, agrupaciones.csv');
}

fetchAndParse().catch(err => { console.error('Error:', err); });
