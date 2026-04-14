import ExcelJS from 'exceljs';
import axios from 'axios';

async function checkNameColColors() {
    const url = process.env.SHEET_URL;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    const sheet = workbook.getWorksheet('CANDIDATOS A CD');
    sheet.eachRow((row, rowNumber) => {
        const nameCell = row.getCell(1);
        if (nameCell.fill && nameCell.fill.type !== 'none') {
            console.log(`Row ${rowNumber}: ${nameCell.value} | NameCell Fill: ${JSON.stringify(nameCell.fill).substring(0, 100)}`);
        }
    });
}

checkNameColColors();
