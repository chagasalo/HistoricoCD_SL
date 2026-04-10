import axios from 'axios';
import ExcelJS from 'exceljs';

const url = process.env.SHEET_URL;

async function checkColors() {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const row2 = sheet.getRow(2);
    
    const years = [2004, 2007, 2010, 2013, 2016, 2019, 2023];
    
    console.log("Year | Col | Green Cells | Total Rows with Content");
    console.log("-----------------------------------------------------");

    years.forEach(year => {
        let col = -1;
        row2.eachCell(c => {
            if (c.value && c.value.toString().includes(year.toString())) col = c.col;
        });

        if (col > 0) {
            let greenCount = 0;
            let contentCount = 0;
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber < 3) return;
                const cell = row.getCell(col);
                const val = cell.value ? cell.value.toString().trim() : '';
                if (val.length > 0) contentCount++;
                
                const fill = cell.fill;
                const isGreen = fill?.fgColor?.argb === 'FF00FF00' || fill?.fgColor?.theme === 6;
                if (isGreen) greenCount++;
            });
            console.log(`${year} | ${col} | ${greenCount} | ${contentCount}`);
        } else {
            console.log(`${year} | -- | -- | --`);
        }
    });
}

checkColors().catch(console.error);
