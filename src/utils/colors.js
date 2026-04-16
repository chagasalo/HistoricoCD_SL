export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export const KNOWN_COLORS = {
  // Principales
  'SL Siglo XXI':       '#002D62',
  'Cruzada x SL':       '#A8000A',
  'Boedo en Accion':    '#007ACC',
  'Volver a SL':        '#D97706',
  'Por San Lorenzo':    '#059669',
  'MAS SL':             '#7C3AED',
  'Prog. Azulgrana':    '#2563EB',
  'Nuevo SL':           '#0891B2',
  // Resto
  'FPA':                '#B45309',
  'Frente SL':          '#0F766E',
  'Grandeza Azulgrana': '#1D4ED8',
  'MBM':                '#6D28D9',
  'N. Generacion':      '#047857',
  'Orden y Progreso':   '#B45309',
  'Primero SL':         '#9333EA',
  'Renovacion SL':      '#0369A1',
  'Rev. Azulgrana':     '#1E40AF',
  'SL Querido':         '#065F46',
  'SL en Marcha':       '#4338CA',
  'Siempre SL':         '#0E7490',
  'Unidos x SL':        '#15803D',
  'Vamos SL':           '#B45309',
  'X Amor a SL':        '#6B21A8',
  // Neutral - no confundir con electos (rojo)
  'TRANSITORIA':        '#64748B',
};

export const getListColor = (listName) => {
  return KNOWN_COLORS[listName] || stringToColor(listName);
};
