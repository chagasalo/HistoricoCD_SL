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
const OUT_JSON_RESULTS = './public/election_results.json';

// Bio Refinement Map (Manual redaction improvements)
const REFINE_BIO_MAP = {
  "MARCELO MORETTI": `Hijo de Luis Ángel Moretti, dirigente de la década de 1980. Abogado (UP) y empresario. Inició su trayectoria política en "De Nuevo San Lorenzo" bajo la presidencia de Héctor Sluga y el apoyo de Fernando Miele. En 2010 lideró su propia agrupación, Boedo en Acción, obteniendo la vocalía por la segunda minoría; renunció en 2012 durante el proceso de acefalía institucional. Posteriormente, integró la lista de San Lorenzo Siglo XXI (Lammens-Tinelli), desempeñándose como vocal oficialista y encargado del Fútbol Senior. Tras renunciar en 2021 por discrepancias con la conducción, retomó su espacio político y resultó electo presidente en 2023 con una amplia alianza estratégica. Su gestión inicial se centró en la estabilización económica mediante la transferencia de jugadores clave para sanear deudas. Sin embargo, su administración enfrentó crisis institucionales significativas, incluyendo la rescisión de contrato de Rubén Darío Insúa y controversias administrativas vinculadas a transferencias. En 2024 y 2025, su presidencia se vio envuelta en tensiones por el debate sobre las Sociedades Anónimas Deportivas y la situación financiera del club, que derivó en la venta de porcentajes de juveniles. El punto de quiebre ocurrió a finales de abril de 2025, tras denuncias de irregularidades en la inscripción de juveniles, lo que derivó en una licencia de 90 días. Finalmente, tras un fallido intento de retomar sus funciones en un clima de fuerte protesta social y procesos judiciales cruzados, la acefalía forzada en diciembre de 2025 puso fin a su mandato.`,
  "LAMMENS MATIAS": `Hijo de Néstor Daniel Lammens, ex vicepresidente de la institución. Abogado (UBA) y empresario del sector vitivinícola. Inició su participación política en 2010 y asumió la presidencia en 2012 respaldado por Marcelo Tinelli. Su primera etapa se caracterizó por éxitos deportivos históricos, destacando el Torneo Inicial 2013, la Copa Libertadores 2014 y la Supercopa Argentina 2015, además de la recuperación institucional con la vuelta a Boedo y la construcción del Polideportivo Roberto Pando. Fue reelecto en 2016 con el 88% de los votos. Esta segunda etapa enfrentó mayores desafíos, incluyendo un aumento del pasivo financiero and deudas por transferencias que afectaron la competitividad del fútbol profesional. Durante este periodo se concretó la compra de terrenos en Av. La Plata, aunque con limitaciones espaciales para el proyecto del estadio. En 2019, Lammens incursionó en la política nacional como Ministro de Turismo y Deportes, manteniendo un rol de vicepresidente en el club. Su intento de retorno a la política activa del club en 2025 bajo la agrupación "Revolución Azulgrana" fue objeto de críticas por parte de sectores de la masa societaria que cuestionaron la falta de transparencia de su estrategia. Actualmente se desempeña como legislador de la Ciudad de Buenos Aires.`,
  "MARCELO TINELLI": `Empresario, periodista y conductor de televisión con una de las trayectorias más influyentes en los medios argentinos. En San Lorenzo, su vínculo comenzó como colaborador externo hasta involucrarse activamente en la gestión en 2007. En 2012 fue electo vicepresidente en la lista de Matías Lammens, rol que ocupó hasta 2019. Su gestión se destacó por el impulso al básquet profesional e internacional y su liderazgo en el área de fútbol profesional. En 2019 fue electo presidente con más del 80% de los votos. No obstante, su mandato coincidió con una profunda crisis financiera institucional, agravada por el contexto de pandemia y compromisos económicos en moneda extranjera que derivaron en deudas significativas. En mayo de 2021 solicitó una licencia de sus funciones y finalmente presentó su renuncia en 2022. También presidió la Superliga y la Liga Profesional de Fútbol a nivel nacional. Desde su alejamiento, se ha mantenido al margen de la política activa del club.`,
  "ARRECEYGOR HORACIO": `Dirigente sindical de amplia trayectoria (SATSAID). Integró diversas agrupaciones desde 2004, participando activamente en la vida política del club. En 2012 se unió a San Lorenzo Siglo XXI, desempeñándose como vocal en múltiples periodos. Fue electo vicepresidente en 2019 y asumió la presidencia de forma interina en 2021 tras la renuncia de Marcelo Tinelli, completando el mandato hasta 2023. Su gestión se enfocó en la transición institucional y la normalización operativa del club en un periodo de alta inestabilidad política.`
};

// Load aliases
let aliases = { candidates: {}, lists: {} };
try {
  const aliasData = fs.readFileSync('./aliases.json', 'utf8');
  const parsed = JSON.parse(aliasData);
  
  const rawCandidates = parsed.candidates || (parsed.lists ? {} : parsed);
  const rawLists = parsed.lists || {};
  
  // Normalize candidate keys
  const normCandidates = {};
  for (const k of Object.keys(rawCandidates)) {
    const normKey = k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/,/g, '').replace(/\s+/g, ' ').trim();
    normCandidates[normKey] = rawCandidates[k];
  }
  
  // Normalize list keys
  const normLists = {};
  for (const k of Object.keys(rawLists)) {
    const normKey = k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/,/g, '').replace(/\s+/g, ' ').trim();
    normLists[normKey] = rawLists[k];
  }

  aliases = {
    candidates: normCandidates,
    lists: normLists
  };
} catch (e) {
  console.warn('No se encontró aliases.json o no es válido, se asumirá vacío.');
}

function normalizeAlias(name) {
  if (!name) return '';
  const norm = name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/,/g, '').replace(/\s+/g, ' ').trim();
  return aliases.candidates[norm] || name.toString().trim();
}

function formatNameAsSurnameFirst(rawName) {
  if (!rawName) return '';
  let name = rawName.toString().trim();
  if (name.includes(',')) return name; // Already has comma
  
  const words = name.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= 1) return name;
  
  // Heuristic: assume last word is surname
  const surname = words.pop();
  return `${surname}, ${words.join(' ')}`;
}

function getSimilarity(s1, s2) {
  let longer = (s1 || "").toUpperCase().replace(/[^\w]/g, '');
  let shorter = (s2 || "").toUpperCase().replace(/[^\w]/g, '');
  if (longer.length < shorter.length) { [longer, shorter] = [shorter, longer]; }
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  // Simple word-based overlap similarity instead of full edit distance for performance
  const words1 = (s1 || "").toUpperCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const words2 = (s2 || "").toUpperCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const intersect = words1.filter(w => words2.includes(w));
  return (2.0 * intersect.length) / (words1.length + words2.length);
}

function smartNormalize(name) {
  if (!name) return '';
  const aliasResolved = normalizeAlias(name);
  return aliasResolved.toString()
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, ' ') // Strip punctuation (incl. * and ,) and replace with spaces
    .split(/\s+/)
    .filter(w => w.length > 0)
    .sort()
    .join(' ');
}

function normalizeListName(list) {
  if (!list) return '';
  let name = list.toString().trim();
  
  // 1. Check aliases.json first
  const norm = name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/,/g, '').replace(/\s+/g, ' ').trim();
  if (aliases.lists?.[norm]) {
    return aliases.lists[norm];
  }

  const lowerName = name.toLowerCase();
  
  // Excluir si es "Independiente" o "Comisión Directiva"
  if (lowerName === 'independiente' || lowerName.includes('comision directiva') || lowerName.includes('comision directi')) return '';
  
  // Normalización base: minúsculas, cambio de 'x' por 'por', expandir SL e ignorar espacios dobles
  let clean = name.toLowerCase()
    .replace(/\s+x\s+/g, ' por ')
    .replace(/\bsl\b/g, 'san lorenzo')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Mapeos definitivos (fuente de verdad)
  if (clean.includes('boedo en accion') || clean.includes('boedo accion')) return 'Boedo en Accion';
  if (clean.includes('cruzada')) return 'Cruzada por San Lorenzo';
  if (clean.includes('vamos san lorenzo')) return 'Vamos San Lorenzo';
  if (clean.includes('grandeza azulgrana')) return 'Grandeza Azulgrana';
  if (clean.includes('orden y progreso sanlorencista')) return 'Orden y Progreso Sanlorencista';
  if (clean.includes('orden y progreso')) return 'Orden y Progreso';
  if (clean.includes('somos san lorenzo')) return 'Somos San Lorenzo';
  if (clean.includes('pasion azulgrana') || lowerName.includes('fpa')) return 'Frente Pasion Azulgrana';
  if (clean.includes('siglo xxi') || clean.includes('sixlo xxi')) return 'San Lorenzo Siglo XXI';
  if (clean.includes('volver a san lorenzo')) return 'Volver a San Lorenzo';
  if (clean.includes('rumbo san lorenzo') || clean.includes('rumbo san lorencista')) return 'Nuevo Rumbo Sanlorencista';
  if (clean.includes('dignidad por san lorenzo')) return 'Dignidad por San Lorenzo';
  if (clean.includes('san lorenzo para todos')) return 'San Lorenzo para Todos';
  if (clean.includes('unidos por san lorenzo')) return 'Unidos por San Lorenzo';
  if (clean.includes('revolucion azulgrana') || clean.includes('rev. azulgrana')) return 'Revolucion Azulgrana';
  if (clean.includes('prog. azulgrana') || clean.includes('proyecto azulgrana')) return 'Proyecto Azulgrana';
  if (clean.includes('movete boedo movete') || clean.includes('boedo movete')) return 'Movete Boedo Movete';

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

      const isElectedSheet = sheetName.includes('E.O') || sheetName.includes('E.E') || sheetName.includes('A.E') || sheetName.includes('ASAMBLEA 2025');
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
           // No retornamos, procesamos esta fila también como data
        }

        const firstCell = row.getCell(2).value?.toString().toUpperCase() || '';
        if (firstCell.includes('ASAMBLEA')) { currentSection = "Asamblea"; return; }
        if (firstCell.includes('FISCALIZADORA')) { currentSection = "Fiscalizadora"; return; }

        if (columnLayouts.length === 0) return; // Si aún no hay layout, no procesamos data


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
             
             if (currentSection === "Comisión Directiva" && !isNaN(parseInt(position)) && rowNumber > 19) {
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
    if (!cleanYear) return null;
    
    // Check both the requested year and its alias (2022 <-> 2023)
    const yearsToSearch = [cleanYear];

    const targetWords = smartNormalize(rawName).split(' ').filter(w => w.length > 0);
    if (targetWords.length === 0) return null;

    for (const y of yearsToSearch) {
      if (!electionPositions[y]) continue;
      const sectionsToSearch = electionPositions[y][category] ? [category] : Object.keys(electionPositions[y]);
      
      let bestMatch = null;
      let maxScore = -1;

      for (const section of sectionsToSearch) {
        for (const entry of electionPositions[y][section]) {
          const entryWords = entry.normalized.split(' ');
          
          // Case 1: Exact match (highest priority)
          if (entry.normalized === smartNormalize(rawName)) return entry.position;

          // Case 2: Partial overlap
          const matchCount = entryWords.filter(w => targetWords.includes(w)).length;
          const score = matchCount / Math.max(entryWords.length, targetWords.length);
          
          if (score > 0.8 && score > maxScore) {
              maxScore = score;
              bestMatch = entry.position;
          }
        }
      }
      if (bestMatch) return bestMatch;
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

      headers.forEach((headerValue, colNumber) => {
        if (colNumber === nameCol) return;
        const yearMatch = headerValue?.toString().match(/\d{4}(\s*\([^)]+\))?/);
        if (!yearMatch) return;
        const year = yearMatch[0].trim();

         const cell = row.getCell(colNumber);
         const val = cell.value?.toString().trim() || '';
         
         // STRICT GREEN DETECTION: As requested, must be green.
         // argb: FF00FF00 is standard green used in the sheet. theme: 6 is Green theme.
         const fill = cell.fill;
         const isGreen = fill?.fgColor?.argb === 'FF00FF00' || fill?.fgColor?.theme === 6;
         
         let isElected = false;
         if (category === 'Asamblea') {
            // Strict for assembly matrix sheets: only trust green coloring to avoid counting all candidates
            isElected = isGreen;
         } else {
            isElected = val.toLowerCase() === 'x' || val.toLowerCase() === 'si' || isGreen;
         }

         if (isElected || val.length >= 3) {
           // Aceptamos nombres de 3 letras (como FPA) pero excluimos SI/NO explicitly
           const isGenericMarker = ['si', 'no'].includes(val.toLowerCase());
           let listName = (val.length >= 3 && !isGenericMarker) ? normalizeListName(val) : null;
           
           // Si no hay agrupación y es verde, usamos un placeholder.
           if (!listName && isElected) {
              listName = "(Sin datos)";
           }

           if (!listName) return; 

           let yearToMatch = year;

           let hist = record.history.find(h => h.year === yearToMatch && h.category === category);
           const cargoFound = findCargo(yearToMatch, candidateName, category);
           
           if (!hist) {
             hist = { 
               year: yearToMatch, 
               list: listName, 
               elected: isElected, 
               category, 
               position: cargoFound,
               originalPos: cargoFound 
             };
             record.history.push(hist);
            } else {
              if (isElected) {
                hist.elected = true;
                // Si la matriz tiene un nombre de lista explícito y NO es el placeholder, manda.
                if (listName && listName !== "(Sin datos)") {
                   hist.list = listName;
                } else if (!hist.list) {
                   // Si no teníamos lista previa (fase 3), usamos el placeholder
                   hist.list = listName || "(Sin datos)";
                }
              } else if (!hist.elected) {
                if (listName && listName !== "(Sin datos)") hist.list = listName;
              }
              
              if (cargoFound) hist.position = cargoFound;
              else if (hist.elected && !hist.position) {
                hist.position = category === 'Comisión Directiva' ? 'Vocal' : 'Miembro';
              }
            }
        }
      });
    });
  });

  // Fase 5: Juntas Electorales y Tribunal de Etica
  console.log('Processing JUNTA ELECTORAL and TRIBUNAL DE ETICA...');
  ['JUNTA ELECTORAL', 'TRIBUNAL DE ETICA'].forEach(sheetName => {
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) return;
    
    const category = sheetName === 'JUNTA ELECTORAL' ? 'Junta Electoral' : 'Tribunal de Ética';
    let yearHeaders = {};
    let startRow = sheetName === 'JUNTA ELECTORAL' ? 3 : 2;

    ws.eachRow((row, rowNumber) => {
      if (sheetName === 'JUNTA ELECTORAL' && rowNumber === 2) {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) yearHeaders[colNumber] = cell.value?.toString().trim();
        });
        return;
      }
      if (sheetName === 'TRIBUNAL DE ETICA' && rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) yearHeaders[colNumber] = cell.value?.toString().trim();
        });
        return;
      }

      if (rowNumber < startRow) return;

      const candidateNameRaw = row.getCell(1).value?.toString().trim();
      if (!candidateNameRaw) return;
      const candidateName = normalizeAlias(candidateNameRaw);
      const candidateKey = smartNormalize(candidateName);

      if (!dataMap.has(candidateKey)) dataMap.set(candidateKey, { name: candidateName, history: [] });
      const record = dataMap.get(candidateKey);

      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) return;
        
        const pos = cell.value?.toString().trim();
        if (pos) {
          const year = yearHeaders[colNumber];
          if (!year) return;

          let hist = record.history.find(h => h.year === year && h.category === category);
          if (!hist) {
            record.history.push({
              year: year,
              list: "(Sin datos)",
              elected: true,
              category: category,
              position: pos,
              originalPos: pos
            });
          } else {
            hist.position = pos;
            hist.originalPos = pos;
            hist.elected = true;
            if (!hist.list) hist.list = "(Sin datos)";
          }
        }
      });
    });
  });

  // Fase 6: Deduplicación Avanzada por Slot Collision
  console.log('Running Advanced Slot Collision Deduplication...');
  const candidates = Array.from(dataMap.entries());
  
  // Use a map to track slots: year|cat|list|pos -> candidateKey
  const slotMap = new Map();
  const redirects = new Map(); // ID_Old -> ID_New

  candidates.forEach(([key, record]) => {
     record.history.forEach(h => {
        const pos = h.position || h.originalPos;
        if (!h.year || !pos || pos.length > 10) return;
        
        // ASSEMBLY DEDUPLICATION: We allow it if they have a numeric position,
        // which strongly indicates they are occupying the same slot among the 90 available.
        if (h.category === 'Asamblea') {
           if (isNaN(parseInt(pos))) return;
        } else {
           if (['Vocal', 'Miembro', 'Asambleista'].includes(pos)) return;
        }

        const slotKey = `${h.year}|${h.category}|${h.list}|${pos}`;
        if (slotMap.has(slotKey)) {
           const existingKey = slotMap.get(slotKey);
           if (existingKey === key) return;
           
           const existingRecord = dataMap.get(existingKey);
           const currentRecord = dataMap.get(key);
           
           // MEMBER SHIELD: If both are elected (SI) in the same year, do NOT merge them
           // unless the names are identical, as they are likely two distinct officials.
           const bothElected = h.elected && existingRecord.history.some(eh => eh.year === h.year && eh.category === h.category && eh.elected);
           if (bothElected) return;

           // Check name compatibility (at least 85% similarity for slot merge)
           const sim = getSimilarity(existingRecord.name, currentRecord.name);
           if (sim > 0.85) {
              console.log(`  Merging ${key} into ${existingKey} (Slot: ${slotKey}, Sim: ${sim.toFixed(2)})`);
              redirects.set(key, existingKey);
           }
        } else {
           slotMap.set(slotKey, key);
        }
     });
  });

  // Apply redirects
  redirects.forEach((newKey, oldKey) => {
     if (oldKey === newKey) return;
     const oldRec = dataMap.get(oldKey);
     const newRec = dataMap.get(newKey);
     if (!oldRec || !newRec) return;

     // Merge history
     oldRec.history.forEach(h => {
        if (!newRec.history.some(nh => nh.year === h.year && nh.category === h.category)) {
           newRec.history.push(h);
        }
     });
     // Prefer longer name for display
     if (oldRec.name.length > newRec.name.length) newRec.name = oldRec.name;
     dataMap.delete(oldKey);
  });

  // Fase 7: Consolidación y Generación de Archivos
  const data = Array.from(dataMap.values())
     .filter(c => c.history.length > 0)
     .map(c => {
        const displayName = formatNameAsSurnameFirst(c.name);
        const bioData = biografiasData.get(smartNormalize(c.name));
        return {
           name: displayName,
           id: smartNormalize(c.name),
           history: c.history,
           biography: REFINE_BIO_MAP[smartNormalize(c.name)] || (bioData ? bioData.text : null),
           status: bioData ? bioData.meta : { hasResigned: false, remarks: [] }
        };
     });

   console.log(`Parsed ${data.length} consolidated candidates. Generando archivos...`);

   // Filter out groupings that do not have any candidates in the processed data
   const activeGroups = new Set();
   data.forEach(c => {
      c.history.forEach(h => {
         if (h.list) activeGroups.add(h.list);
      });
   });

   for (const name of agrupacionesData.keys()) {
      if (!activeGroups.has(name)) {
         console.log(`⚠️ Filtrando agrupación sin candidatos: "${name}"`);
         agrupacionesData.delete(name);
      }
   }

  // Escribir JSON App
  fs.writeFileSync(OUT_JSON, JSON.stringify({ 
     updatedAt: new Date().toISOString(), 
     candidates: data,
     agrupaciones: Object.fromEntries(agrupacionesData)
  }, null, 2));

  // CSV de Candidatos
  const candidatesCSVHeaders = ["ID_Candidato", "Nombre", "Biografia", "Tiene_Renuncia", "Observaciones"];
  const candidatesCSVRows = data.map(c => [
     c.id, c.name, c.biography || '', c.status.hasResigned ? 'SI' : 'NO', c.status.remarks.join(' - ')
  ]);
  writeCSV(OUT_CSV_CANDIDATES, candidatesCSVHeaders, candidatesCSVRows);

  // CSV de Historial
  const historyCSVHeaders = ["ID_Candidato", "Nombre", "Año", "Agrupacion", "Categoria", "Cargo", "Electo"];
  const historyCSVRows = [];
  data.forEach(c => {
     c.history.forEach(h => {
        historyCSVRows.push([
           c.id, c.name, h.year, h.list, h.category, h.position || h.originalPos || '', h.elected ? 'SI' : 'NO'
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

  // Fase 8: Extraer Resultados de Elecciones
  const resultsData = [];
  const wsResults = workbook.getWorksheet('RESULTADOS');
  if (wsResults) {
    console.log('Processing election results from RESULTADOS...');
    let currentElection = null;
    
    wsResults.eachRow((row, rowNumber) => {
      const rowValues = row.values;
      const cells = Array.isArray(rowValues) ? rowValues : [];
      
      const mainTitle = cells.find(c => c && c.toString().includes('ELECCIONES'));
      if (mainTitle) {
        const titleStr = mainTitle.toString().trim();
        const yearMatch = titleStr.match(/\d{4}/);
        currentElection = {
          title: titleStr,
          year: yearMatch ? yearMatch[0] : null,
          results: [],
          total: 0,
          habilitados: 0
        };
        resultsData.push(currentElection);
        return;
      }
      
      if (!currentElection) return;
      
      const rowStr = cells.join(' ').toUpperCase();
      
      if (rowStr.includes('TOTAL') && !rowStr.includes('VOTOS')) {
         const val = cells.find((c, i) => i > 4 && (typeof c === 'number' || (typeof c === 'object' && c.result)));
         currentElection.total = typeof val === 'object' ? val.result : val;
         return;
      }
      if (rowStr.includes('HABILITADOS')) {
         const val = cells.find((c, i) => i > 4 && (typeof c === 'number' || (typeof c === 'object' && c.result)));
         currentElection.habilitados = typeof val === 'object' ? val.result : val;
         return;
      }
      
      if (rowStr.includes('AGRUPACION') || rowStr.includes('CANDIDATOS')) return;
      
      const agrupTitle = cells[4] || cells[5]; 
      if (agrupTitle && (typeof agrupTitle === 'string')) {
         const name = agrupTitle.trim();
         if (name === 'VOTOS EN BLANCO/NULOS' || name.length > 3) {
            const votos = cells[8] || cells[9];
            const perc = cells[9] || cells[10];
            
            if (votos || perc) {
               currentElection.results.push({
                  agrupacion: name === 'VOTOS EN BLANCO/NULOS' ? name : normalizeListName(name),
                  presidente: (cells[5] || cells[6])?.toString().trim(),
                  votos: typeof votos === 'object' ? votos.result : (typeof votos === 'number' ? votos : 0),
                  porcentaje: typeof perc === 'object' ? perc.result : (typeof perc === 'number' ? perc : 0)
               });
            }
         }
      }
    });
  }
  
  const finalResults = resultsData.filter(e => e.results.length > 0 || e.year === '2026');
  fs.writeFileSync(OUT_JSON_RESULTS, JSON.stringify(finalResults, null, 2));

  console.log('Exito! Generados: data.json, candidates.csv, history.csv, agrupaciones.csv, election_results.json');
}

fetchAndParse().catch(err => { console.error('Error:', err); });
