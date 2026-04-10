function smartNormalize(name) {
  if (!name) return '';
  return name.toString()
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, ' ') // Strip punctuation (incl. * and ,) and replace with spaces
    .split(/\s+/)
    .filter(w => w.length > 0)
    .sort()
    .join(' ');
}

console.log(`'Acuña, Claudia Analia' -> '${smartNormalize('Acuña, Claudia Analia')}'`);
console.log(`'ACUÑA CLAUDIA ANALIA' -> '${smartNormalize('ACUÑA CLAUDIA ANALIA')}'`);
