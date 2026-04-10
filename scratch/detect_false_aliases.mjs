import fs from 'fs';

const aliasesPath = './aliases.json';
const historyPath = './public/history.csv';

// Load existing aliases
const existingAliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));

// Load history (the currently generated one before reverting)
const content = fs.readFileSync(historyPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim().length > 0).slice(1);

const participations = [];
lines.forEach(line => {
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 7) return;
    const year = parts[2].replace(/"/g, '').trim();
    const list = parts[3].replace(/"/g, '').trim();
    const cat = parts[4].replace(/"/g, '').trim();
    const pos = parts[5]?.replace(/"/g, '').trim() || '';
    const id = parts[0].trim();
    const name = parts[1].replace(/"/g, '').trim();
    participations.push({ id, name, year, list, cat, pos });
});

// Group by ID and find if any ID has multiple positions in the same election
const idCollisions = [];
const groupedById = {};
participations.forEach(p => {
    if (!groupedById[p.id]) groupedById[p.id] = [];
    groupedById[p.id].push(p);
});

console.log("Detecting IDs with multiple positions in the same election...");

for (const id in groupedById) {
    const entries = groupedById[id];
    // Group entries by (Year, List, Category)
    const electionGroups = {};
    entries.forEach(e => {
        const key = `${e.year}|${e.list}|${e.cat}`;
        if (!electionGroups[key]) electionGroups[key] = [];
        electionGroups[key].push(e);
    });

    for (const key in electionGroups) {
        const slots = electionGroups[key];
        const uniquePos = new Set(slots.map(s => s.pos).filter(p => !isNaN(parseInt(p))));
        if (uniquePos.size > 1) {
            idCollisions.push({ id, key, positions: Array.from(uniquePos) });
        }
    }
}

console.log(`Found ${idCollisions.length} IDs with internal slot collisions (False Positives):`);
idCollisions.forEach(c => {
    console.log(`- ID "${c.id}" in ${c.key} occupies positions: ${c.positions.join(', ')}`);
});

// Now find which aliases in aliases.json point to these IDs
const toRemove = [];
for (const rawName in existingAliases.candidates) {
    const target = existingAliases.candidates[rawName];
    // Check if the target is one of the colliding IDs
    if (idCollisions.some(c => c.id === target.toUpperCase().replace(/,/g, '').replace(/\s+/g, ' ').trim() || c.id === target)) {
        toRemove.push(rawName);
    }
}

// Special check for Romano case
if (existingAliases.candidates["ROMANO JORGE"]) toRemove.push("ROMANO JORGE");

console.log("\nProposed aliases to remove (to restore individual identities):");
toRemove.forEach(r => console.log(`- ${r}`));
