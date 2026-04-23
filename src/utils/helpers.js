export const getCargoRank = (pos) => {
  if (!pos) return 999;
  const p = pos.toLowerCase().trim();
  
  // Direct match for major CD roles
  if (p.includes('presidente') && !p.includes('vice')) return 0;
  if (p.includes('vice-presidente') || p.includes('vicepresidente') || p.includes('vice presidente')) return 1;
  if (p.includes('secretari')) return 2; // matches secretario and secretaria
  if (p.includes('tesorero')) return 3;
  if (p.includes('miembro')) return 4;
  
  // Handle numeric positions (used in Asamblea and Fiscal Commission)
  const numMatch = p.match(/^(\d+)$/);
  if (numMatch) {
    return 100 + parseInt(numMatch[1]);
  }

  // Handle "Vocal X"
  if (p.includes('vocal')) {
    const match = p.match(/\d+/);
    return 10 + (match ? parseInt(match[0]) : 99);
  }
  
  return 500;
};

export const getCategorizedGroups = (history) => {
  const catMap = new Map();
  const sorted = [...history].sort((a,b) => (b.year || '').localeCompare(a.year || ''));
  
  sorted.forEach(h => {
      const cat = h.category || 'Comisión Directiva';
      if (!catMap.has(cat)) catMap.set(cat, new Map());
      const listMap = catMap.get(cat);
      if (!listMap.has(h.list)) listMap.set(h.list, []);
      listMap.get(h.list).push(h);
  });
  
  return Array.from(catMap.entries()).map(([category, listMap]) => ({
      category,
      lists: Array.from(listMap.entries()).map(([listName, items]) => ({
          list: listName,
          items
      }))
  })).sort((a, b) => {
      // Sort categories: CD first, then others
      if (a.category === 'Comisión Directiva') return -1;
      if (b.category === 'Comisión Directiva') return 1;
      return a.category.localeCompare(b.category);
  });
};
