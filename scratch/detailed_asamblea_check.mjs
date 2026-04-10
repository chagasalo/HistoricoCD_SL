import axios from 'axios';
import ExcelJS from 'exceljs';

const url = process.env.SHEET_URL;

async function detailedCheck() {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row2 = sheet.getRow(2);
    
    // Check 2004 (Goal 60, Found 55)
    let col2004 = -1;
    row2.eachCell(c => { if (c.value && c.value.toString().includes('2004')) col2004 = c.col; });
    
    if (col2004 > 0) {
        console.log("--- Investigating 2004 Gap (55/60) ---");
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber < 3) return;
            const cell = row.getCell(col2004);
            const val = cell.value ? cell.value.toString().trim() : '';
            const fill = cell.fill;
            const isGreen = fill?.fgColor?.argb === 'FF00FF00' || fill?.fgColor?.theme === 6;
            
            if (val.length > 0 && !isGreen) {
                const name = row.getCell(1).value; // Assuming col 1 is names
                console.log(`Row ${rowNumber}: [${val}] ${name} (NOT GREEN)`);
            }
        });
    }

    // Check 2007 (Goal 60, Found 59)
    let col2007 = -1;
    row2.eachCell(c => { if (c.value && c.value.toString().includes('2007')) col2007 = c.col; });
    
    if (col2007 > 0) {
        console.log("\n--- Investigating 2007 Gap (59/60) ---");
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber < 3) return;
            const cell = row.getCell(col2007);
            const val = cell.value ? cell.value.toString().trim() : '';
            const fill = cell.fill;
            const isGreen = fill?.fgColor?.argb === 'FF00FF00' || fill?.fgColor?.theme === 6;
            
            if (val.length > 0 && !isGreen) {
                const name = row.getCell(1).value;
                console.log(`Row ${rowNumber}: [${val}] ${name} (NOT GREEN)`);
            }
        });
    }
}

detailedCheck().catch(console.error);
