import ExcelJS from 'exceljs';
import axios from 'axios';

async function check2019Lists() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('ASAMBLEISTAS');
    const col2019 = 4;
    const lists = new Set();
    
    sheet.eachRow((row) => {
        const val = row.getCell(col2019).value;
        if (val) lists.add(val.toString().trim());
    });
    
    console.log("Unique values in 2019 Asamblea col:");
    console.log(Array.from(lists));
}

check2019Lists();
