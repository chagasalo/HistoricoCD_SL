import fs from 'fs';

const content = fs.readFileSync('./public/history.csv', 'utf8');
const lines = content.split('\n').slice(1);

console.log("Details for Assembly members in 2023:");
lines.forEach(line => {
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 7) return;
    
    const id = parts[0].trim();
    const name = parts[1].replace(/"/g, '').trim();
    const year = parts[2].replace(/"/g, '').trim();
    const list = parts[3].replace(/"/g, '').trim();
    const cat = parts[4].replace(/"/g, '').trim();
    const pos = parts[5]?.replace(/"/g, '').trim() || '';
    
    if (year === '2023' && cat === 'Asamblea') {
        process.stdout.write(`[${list}] ${pos}: ${name}\n`);
    }
});
