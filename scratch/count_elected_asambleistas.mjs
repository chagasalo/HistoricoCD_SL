import fs from 'fs';

const content = fs.readFileSync('./public/history.csv', 'utf8');
const lines = content.split('\n').slice(1);
const electedCounts = {};

lines.forEach(line => {
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 7) return;
    
    const year = parts[2].replace(/"/g, '').trim();
    const cat = parts[4].replace(/"/g, '').trim();
    const elected = parts[6]?.replace(/"/g, '').trim() || '';
    
    if (cat === 'Asamblea' && (elected === 'SI' || elected === 'TRUE')) {
        if (!electedCounts[year]) electedCounts[year] = 0;
        electedCounts[year]++;
    }
});

console.log("Elected Assembly members per year:");
Object.keys(electedCounts).sort().forEach(year => {
    console.log(`${year}: ${electedCounts[year]}`);
});
