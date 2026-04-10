import fs from 'fs';

const aliasesPath = './aliases.json';
const historyPath = './public/history.csv';

const existingAliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));

// We need the RAW data before the aliases were applied to see the original positions.
// But we can check history.csv to see if any ID now has "missing" slots.

// Let's just create a list of aliases that are likely relatives:
// Same surname, shared name, but both were present in the same list.

console.log("Auditing candidates to find relatives that were incorrectly unified...");

const collisions = [
    { from: "ROMANO JORGE", to: "ROMANO JORGE ANTONIO" },
    { from: "MUNDO HERNAN", to: "MUNDO HERNAN ANTONIO" },
    { from: "MUNDO JOSE EDUARDO", to: "MUNDO JOSE RICARDO" },
    { from: "ALVAREZ ADRIAN HORACIO", to: "ALVAREZ ADRIAN HERNAN" },
    { from: "GAUDIO RUBEN OSMAR", to: "GAUDIO RUBEN OMAR" },
    { from: "POUSTIS RUBEN DARIO", to: "POUSTIS RUBEN JAVIER" }
];

// I'll check which of these are actually in aliases.json
const toRemove = [];
for (const key in existingAliases.candidates) {
    if (collisions.some(c => c.from === key || c.to === key)) {
        toRemove.push(key);
    }
}

// Also check for any name that contains a suffix or prefix that was unified
// but actually represents different positions.

console.log("Removing aliases for:");
toRemove.forEach(r => console.log(`- ${r}`));

toRemove.forEach(r => {
    delete existingAliases.candidates[r];
});

fs.writeFileSync(aliasesPath, JSON.stringify(existingAliases, null, 2));
console.log("\nUpdated aliases.json successfully.");
