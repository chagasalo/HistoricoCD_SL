import { useState, useEffect, useMemo } from 'react';
import { Search, Users, ShieldCheck, Shield, CheckCircle2, ArrowRightLeft, ChevronLeft, ChevronRight, BarChart3, RotateCw, Twitter, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

const KNOWN_COLORS = {
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


const getListColor = (listName) => {
  return KNOWN_COLORS[listName] || stringToColor(listName);
};

export default function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [activeTab, setActiveTab] = useState('candidates'); 
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sorting and Pagination State
  const [sortMode, setSortMode] = useState('mostElected'); 
  const [onlyElected, setOnlyElected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 48;

  const [sortModePases, setSortModePases] = useState('mostLists');
  const [pasesPage, setPasesPage] = useState(1);
  const pasesPerPage = 48;

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/data.json?t=' + Date.now());
      const json = await res.json();
      setData(json);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Whenever filters change, reset pagination
  useEffect(() => {
     setCurrentPage(1);
  }, [searchTerm, selectedList, selectedYear, sortMode, onlyElected]);

  useEffect(() => {
     setPasesPage(1);
  }, [sortModePases]);

  const { filteredCandidates, uniqueLists, uniqueYears, totalElected, sortedTransitions, boardConfigs } = useMemo(() => {
    const lists = new Set();
    const years = new Set();
    let electedCount = 0;
    const transMap = new Map(); // to track total lists per candidate for 'Mapa de Pases'
    
    const boardMap = new Map(); // For Conformaciones de CD
    
    data.forEach(c => {
      const sortedHistory = [...c.history].sort((a, b) => (a.year || '').localeCompare(b.year || ''));
      let prevList = null;
      let prevYear = null;
      const userLists = new Set();

      sortedHistory.forEach(h => {
        lists.add(h.list);
        years.add(h.year);
        userLists.add(h.list);
        
        if (h.elected) {
            electedCount++;
            
            // Build board configurations aggregate
            if (!boardMap.has(h.year)) {
                boardMap.set(h.year, new Map());
            }
            const yearData = boardMap.get(h.year);
            yearData.set(h.list, (yearData.get(h.list) || 0) + 1);
        }

        if (prevList && prevList !== h.list) {
            if (!transMap.has(c.name)) {
                transMap.set(c.name, {
                   name: c.name,
                   totalLists: 0,
                   moves: []
                });
            }
            transMap.get(c.name).moves.push({
                fromYear: prevYear,
                fromList: prevList,
                toYear: h.year,
                toList: h.list
            });
        }
        prevList = h.list;
        prevYear = h.year;
      });
      // Build per-list election count
      const listCountMap = new Map();
      sortedHistory.forEach(h => listCountMap.set(h.list, (listCountMap.get(h.list) || 0) + 1));

      if (transMap.has(c.name)) {
         const entry = transMap.get(c.name);
         entry.totalLists = userLists.size;
         entry.listCounts = Object.fromEntries(listCountMap);
         // Sort moves: most recent first
         entry.moves.sort((a, b) => b.toYear.localeCompare(a.toYear));
      }
    }); // end data.forEach

    const term = searchTerm.toLowerCase();
    
    let filtered = data.filter(c => {
      if (term && !c.name.toLowerCase().includes(term)) return false;
      // A candidate passes if at least one history entry satisfies ALL active filters simultaneously.
      // This ensures "solo electos" + year means "elected IN that specific year", not "ever elected".
      return c.history.some(h => {
        if (selectedYear && h.year !== selectedYear) return false;
        if (selectedList && h.list !== selectedList) return false;
        if (onlyElected && !h.elected) return false;
        return true;
      });
    });

    // Custom Sorting for Candidates
    filtered.sort((a, b) => {
        if (sortMode === 'mostElected') {
            const eA = a.history.filter(h => h.elected).length;
            const eB = b.history.filter(h => h.elected).length;
            if (eB !== eA) return eB - eA;
        } else if (sortMode === 'mostYears') {
            const yA = a.history.length;
            const yB = b.history.length;
            if (yB !== yA) return yB - yA;
        }
        return a.name.localeCompare(b.name);
    });

    const sortedYears = Array.from(years).filter(y => y).sort((a, b) => b.localeCompare(a));

    // Transitions sorting
    let trArray = Array.from(transMap.values());
    if (sortModePases === 'mostLists') {
        trArray.sort((a, b) => b.totalLists - a.totalLists || a.name.localeCompare(b.name));
    } else {
        trArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    // BoardConfigs (Conformaciones) aggregation format
    const aggregatedBoards = Array.from(boardMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Descending years
        .map(([year, listCounts]) => {
            const listsDetails = Array.from(listCounts.entries())
                .sort((a, b) => b[1] - a[1]) // Descending by member count
                .map(([listName, count]) => ({ listName, count }));
                
            return {
                year,
                totalMembers: listsDetails.reduce((sum, item) => sum + item.count, 0),
                lists: listsDetails
            };
        });
    return {
      filteredCandidates: filtered,
      uniqueLists: Array.from(lists).sort(),
      uniqueYears: sortedYears,
      totalElected: new Set(
          data.filter(c => c.history.some(h => h.elected)).map(c => c.name)
      ).size,
      sortedTransitions: trArray,
      boardConfigs: aggregatedBoards
    };
  }, [data, searchTerm, selectedList, selectedYear, sortMode, sortModePases, onlyElected]);

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff'}}>Cargando...</div>;
  }

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
  const currentCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPasesPages = Math.max(1, Math.ceil(sortedTransitions.length / pasesPerPage));
  const currentPases = sortedTransitions.slice((pasesPage - 1) * pasesPerPage, pasesPage * pasesPerPage);

  // Grouping function for candidate card
  const getCardGroups = (history) => {
      const groupMap = new Map();
      const sorted = [...history].sort((a,b) => (b.year || '').localeCompare(a.year || ''));
      sorted.forEach(h => {
          if (!groupMap.has(h.list)) groupMap.set(h.list, []);
          groupMap.get(h.list).push(h);
      });
      return Array.from(groupMap.entries()).map(([listName, items]) => ({
          list: listName,
          items
      }));
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-actions">
           <a 
             href="https://x.com/mariano_casla99" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="action-button twitter-button"
             title="Data por @mariano_casla99"
           >
             <Twitter size={18} />
             <span>@mariano_casla99</span>
           </a>
           <button 
             className={`action-button refresh-button ${isRefreshing ? 'spinning' : ''}`}
             onClick={handleRefresh}
             disabled={isRefreshing}
           >
             <RotateCw size={18} />
             <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Información'}</span>
           </button>
        </div>

        <h1 className="header-title">Candidatos a Comisión Directiva</h1>
        <p className="header-subtitle">
          Análisis e histórico de la política en San Lorenzo
        </p>

        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="refresh-toast"
            >
              ¡Información actualizada con éxito!
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: 'rgba(0, 45, 98, 0.4)'}}><Users size={28} /></div>
          <div className="stat-info">
            <h3>Candidatos Únicos</h3>
            <p>{data.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: 'rgba(168, 0, 10, 0.4)'}}><Shield size={28} /></div>
          <div className="stat-info">
            <h3>Agrupaciones</h3>
            <p>{uniqueLists.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981'}}>
            <ShieldCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>Personas Electas</h3>
            <p>{totalElected}</p>
          </div>
        </div>
      </section>

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
          Explorador de Candidatos
        </button>
        <button className={`tab-button ${activeTab === 'transitions' ? 'active' : ''}`} onClick={() => setActiveTab('transitions')}>
          Mapa de Pases Históricos
        </button>
        <button className={`tab-button ${activeTab === 'conformaciones' ? 'active' : ''}`} onClick={() => setActiveTab('conformaciones')}>
          Conformación de Comisiones
        </button>
      </div>

      {activeTab === 'candidates' && (
        <>
          <section className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar candidato..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filters-wrapper">
                <select className="dropdown-filter" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                  <option value="">Todos los Años</option>
                  {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <select className="dropdown-filter" value={selectedList} onChange={e => setSelectedList(e.target.value)}>
                  <option value="">Todas las Agrupaciones</option>
                  {uniqueLists.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select className="dropdown-filter" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                  <option value="alpha">Orden Alfabético</option>
                  <option value="mostElected">Más veces Electo</option>
                  <option value="mostYears">Más años en Listas</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--azul-casla)', cursor: 'pointer', padding: '0 0.5rem' }}>
                   <input type="checkbox" checked={onlyElected} onChange={e => setOnlyElected(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--rojo-casla)' }} />
                   Solo Electos
                </label>
              </div>
            </div>
            
            <div style={{marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase'}}>
                <span style={{display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'var(--rojo-casla)', borderRadius: '50%'}}></span>
                Años en rojo: El candidato resultó electo a la Comisión Directiva.
            </div>
          </section>

          <section className="candidates-grid">
            <AnimatePresence mode="popLayout">
              {currentCandidates.map((c, idx) => {
                const cardGroups = getCardGroups(c.history);
                const mainList = cardGroups[0].list;

                return (
                  <motion.div 
                    key={`${c.name}-${sortMode}-${currentPage}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx > 20 ? 0 : idx * 0.02 }}
                    className="candidate-card"
                    style={{ borderTop: `4px solid ${getListColor(mainList)}` }}
                  >
                    <div className="candidate-header">
                      <h3 className="candidate-name">{c.name}</h3>
                    </div>
                    
                    <div className="candidate-lists-container">
                        {cardGroups.map((g, gIndex) => (
                           <div key={gIndex} className="candidate-list-row">
                               <span className="row-list-name" style={{color: getListColor(g.list)}}>
                                 {g.list}
                               </span>
                               <span className="row-years">
                                 {g.items.map((h, i) => (
                                   <span key={i} className={`row-year ${h.elected ? 'elected' : ''}`}>
                                     {h.year}{h.elected && <CheckCircle2 size={10} />}
                                   </span>
                                 ))}
                               </span>
                           </div>
                        ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </section>
          
          {filteredCandidates.length === 0 && (
            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
              No se encontraron candidatos.
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={20}/></button>
                <span>Página {currentPage} de {totalPages} ({filteredCandidates.length} res.)</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={20}/></button>
            </div>
          )}
        </>
      )}

      {activeTab === 'transitions' && (
        <section className="transitions-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                <div>
                   <h2 style={{fontFamily: 'var(--font-heading)'}}>Historial de Pases (Transfuguismo)</h2>
                   <p style={{color: 'var(--text-muted)'}}>Candidatos que participaron en distintas listas.</p>
                </div>
                <select className="dropdown-filter" value={sortModePases} onChange={e => setSortModePases(e.target.value)}>
                    <option value="recent">Orden Alfabético</option>
                    <option value="mostLists">Agrupaciones Cambiadas (Mayor a Menor)</option>
                </select>
            </div>
            
            <div className="transitions-list">
                {currentPases.map((t, idx) => (
                    <motion.div 
                       key={`${t.name}-${sortModePases}-${pasesPage}`} 
                       className="transition-card"
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                    >
                         <div className="transition-name-row">
                            <span className="transition-name">{t.name}</span>
                            <span className="transition-count">{t.totalLists} agrup.</span>
                         </div>
                         {t.moves.map((m, mIdx) => (
                            <div key={mIdx} className="transition-flow">
                                <div className="t-from">
                                    <span className="t-year">{m.fromYear}</span>
                                    <span className="t-list-name" style={{color: getListColor(m.fromList)}}>
                                      {m.fromList}
                                      <span className="t-list-elec">{t.listCounts?.[m.fromList] || 1} elec.</span>
                                    </span>
                                </div>
                                <ArrowRightLeft className="t-arrow" size={14} />
                                <div className="t-to">
                                    <span className="t-year">{m.toYear}</span>
                                    <span className="t-list-name" style={{color: getListColor(m.toList)}}>
                                      {m.toList}
                                      <span className="t-list-elec">{t.listCounts?.[m.toList] || 1} elec.</span>
                                    </span>
                                </div>
                            </div>
                         ))}
                    </motion.div>
                ))}
            </div>

            {totalPasesPages > 1 && (
            <div className="pagination">
                <button disabled={pasesPage === 1} onClick={() => setPasesPage(p => p - 1)}><ChevronLeft size={20}/></button>
                <span>Página {pasesPage} de {totalPasesPages}</span>
                <button disabled={pasesPage === totalPasesPages} onClick={() => setPasesPage(p => p + 1)}><ChevronRight size={20}/></button>
            </div>
            )}
        </section>
      )}

      {activeTab === 'conformaciones' && (
          <section className="board-section">
              <div style={{marginBottom: '2rem'}}>
                 <h2 style={{fontFamily: 'var(--font-heading)'}}>Conformaciones Históricas</h2>
                 <p style={{color: 'var(--text-muted)'}}>Integrantes electos a la Comisión Directiva desglosados por agrupación política en cada elección.</p>
              </div>

              <div className="board-years-grid">
                  {boardConfigs.map((bc, idx) => (
                      <motion.div 
                         key={bc.year}
                         className="board-card"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.05 }}
                      >
                         <div className="board-card-header">
                            <h3 className="board-year">Elecciones {bc.year}</h3>
                            <span className="board-total"><BarChart3 size={16} /> {bc.totalMembers} Electos</span>
                         </div>
                         <div className="board-lists">
                            {bc.lists.map((l, lIdx) => (
                               <div key={lIdx} className="board-list-item">
                                   <div className="board-list-name">
                                      <span className="color-dot" style={{ backgroundColor: getListColor(l.listName), display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px' }}></span>
                                      {l.listName}
                                   </div>
                                   <div className="board-list-count">{l.count}</div>
                               </div>
                            ))}
                         </div>
                      </motion.div>
                  ))}
              </div>
          </section>
      )}

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-credits">
            Vibecodeado por: <a href="https://x.com/chagasalo" target="_blank" rel="noopener noreferrer">Gonzalo Suarez (@chagasalo)</a> & Antigravity AI.
          </p>
          <a href="https://github.com/chagasalo/HistoricoCD_SL" target="_blank" rel="noopener noreferrer" className="footer-repo-link">
            <Github size={18} />
            <span>Ver código en GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
