export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export const KNOWN_COLORS = {
  // Principales - Nombres Cortos
  'SL Siglo XXI':       '#002D62',
  'Cruzada x SL':       '#A8000A',
  'Boedo en Accion':    '#007ACC',
  'Volver a SL':        '#D97706',
  'Por San Lorenzo':    '#059669',
  'MAS SL':             '#7C3AED',
  'Prog. Azulgrana':    '#2563EB',
  'Nuevo SL':           '#0891B2',
  
  // Principales - Nombres Canónicos Unificados
  'San Lorenzo Siglo XXI':    '#002D62',
  'Cruzada por San Lorenzo':  '#A8000A',
  'Volver a San Lorenzo':     '#D97706',
  'Frente Pasión Azulgrana':  '#B45309',
  'Frente Pasion Azulgrana':  '#B45309',
  'Movete Boedo Movete':      '#6D28D9',
  'Nueva Generación':         '#047857',
  'Nueva Generacion':         '#047857',
  'Primero San Lorenzo':      '#9333EA',
  'Renovación Sanlorencista': '#0369A1',
  'Renovacion Sanlorencista': '#0369A1',
  'Revolución Azulgrana':     '#1E40AF',
  'Revolucion Azulgrana':     '#1E40AF',
  'San Lorenzo Querido':      '#065F46',
  'San Lorenzo en Marcha':    '#4338CA',
  'Siempre San Lorenzo':      '#0E7490',
  'Unidos por San Lorenzo':   '#15803D',
  'Vamos San Lorenzo':        '#B45309',
  'X Amor a San Lorenzo':     '#6B21A8',
  'Proyecto Azulgrana':       '#2563EB',
  'Nuevo Rumbo Sanlorencista':'#0891B2',

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
