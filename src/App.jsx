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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('candidates'); 
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  // Sorting and Pagination State
  const [sortMode, setSortMode] = useState('mostLists'); 
  const [onlyElected, setOnlyElected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 80;

  const [sortModePases, setSortModePases] = useState('importance');
  const [pasesPage, setPasesPage] = useState(1);
  const pasesPerPage = 48;

  const [selectedBoardCategory, setSelectedBoardCategory] = useState('Comisión Directiva');
  const [selectedBoardYear, setSelectedBoardYear] = useState(null);

  // Hash-based routing for Deep Linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['candidates', 'transitions', 'conformaciones'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange(); // Initial check
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        // Robustez: soporte para formato nuevo (objeto) y viejo (array)
        if (Array.isArray(json)) {
          setData(json);
        } else if (json && json.candidates) {
          setData(json.candidates);
          if (json.updatedAt) {
            const date = new Date(json.updatedAt);
            const formatted = date.toLocaleString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            setLastUpdated(formatted);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);



  // Whenever filters change, reset pagination
  useEffect(() => {
     setCurrentPage(1);
  }, [searchTerm, selectedList, selectedYear, selectedCategory, sortMode, onlyElected]);

  useEffect(() => {
     setPasesPage(1);
  }, [sortModePases]);

  const { filteredCandidates, uniqueLists, uniqueYears, globalListsCount, globalElectedCount, sortedTransitions, boardConfigs } = useMemo(() => {
    const lists = new Set();
    const years = new Set();
    let electedCount = 0;
    const transMap = new Map(); // to track total lists per candidate for 'Mapa de Pases'
    
    // boardMap structure: { [category]: { [year]: { [list]: count } } }
    const boardMap = {
      'Comisión Directiva': new Map(),
      'Asamblea': new Map(),
      'Fiscalizadora': new Map()
    };
    
    // boardMembersMap structure: { [category]: { [year]: [{ name, list }] } }
    const boardMembersMap = {
      'Comisión Directiva': new Map(),
      'Asamblea': new Map(),
      'Fiscalizadora': new Map()
    };
    
    const listsByYear = new Map();
    const yearsByList = new Map();
    
    data.forEach(c => {
      const sortedHistory = [...(c.history || [])].sort((a, b) => (a.year || '').localeCompare(b.year || ''));
      let prevList = null;
      let prevYear = null;
      const userLists = new Set();

      sortedHistory.forEach(h => {
        lists.add(h.list);
        years.add(h.year);
        userLists.add(h.list);

        if (!listsByYear.has(h.year)) listsByYear.set(h.year, new Set());
        listsByYear.get(h.year).add(h.list);
        
        if (!yearsByList.has(h.list)) yearsByList.set(h.list, new Set());
        yearsByList.get(h.list).add(h.year);
        
        if (h.elected) {
            electedCount++;
            
            const catKey = h.category || 'Comisión Directiva';
            const catMap = boardMap[catKey];
            if (catMap) {
              if (!catMap.has(h.year)) catMap.set(h.year, new Map());
              const yearData = catMap.get(h.year);
              yearData.set(h.list, (yearData.get(h.list) || 0) + 1);
            }

            const catMembersMap = boardMembersMap[catKey];
            if (catMembersMap) {
              if (!catMembersMap.has(h.year)) catMembersMap.set(h.year, []);
              catMembersMap.get(h.year).push({ name: c.name, list: h.list, history: c.history });
            }
        }

        if (prevList && prevList !== h.list) {
             if (!transMap.has(c.name)) {
                 transMap.set(c.name, {
                    name: c.name,
                    totalLists: 0,
                    history: c.history,
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

    const filtered = data.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasHistoryMatch = c.history.some(h => {
        if (selectedYear && h.year !== selectedYear) return false;
        if (selectedList && h.list !== selectedList) return false;
        if (onlyElected && !h.elected) return false;
        if (selectedCategory && h.category !== selectedCategory) return false;
        return true;
      });
      return matchesSearch && hasHistoryMatch;
    });

    // Custom Sorting: CD Elected > CD Part > Fiscal Elected > Fiscal Part > Asamblea Elected > Asamblea Part
    const getCatStats = (history, cat) => {
      const entries = history.filter(h => h.category === cat);
      return {
        total: entries.length,
        elected: entries.filter(h => h.elected).length
      };
    };

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      
      // Default / 'mostLists' (Political Importance)
      const statsA = {
        cd: getCatStats(a.history, 'Comisión Directiva'),
        f: getCatStats(a.history, 'Fiscalizadora'),
        as: getCatStats(a.history, 'Asamblea')
      };
      const statsB = {
        cd: getCatStats(b.history, 'Comisión Directiva'),
        f: getCatStats(b.history, 'Fiscalizadora'),
        as: getCatStats(b.history, 'Asamblea')
      };

      // 1. CD Elected
      if (statsB.cd.elected !== statsA.cd.elected) return statsB.cd.elected - statsA.cd.elected;
      // 2. CD Total
      if (statsB.cd.total !== statsA.cd.total) return statsB.cd.total - statsA.cd.total;
      // 3. Fiscal Elected
      if (statsB.f.elected !== statsA.f.elected) return statsB.f.elected - statsA.f.elected;
      // 4. Fiscal Total
      if (statsB.f.total !== statsA.f.total) return statsB.f.total - statsA.f.total;
      // 5. Asamblea Elected
      if (statsB.as.elected !== statsA.as.elected) return statsB.as.elected - statsA.as.elected;
      // 6. Asamblea Total
      if (statsB.as.total !== statsA.as.total) return statsB.as.total - statsA.as.total;
      
      return a.name.localeCompare(b.name);
    });

    const sortedYears = Array.from(years).filter(y => y).sort((a, b) => b.localeCompare(a));

    const finalAvailableLists = selectedYear 
        ? Array.from(listsByYear.get(selectedYear) || []).sort()
        : Array.from(lists).sort();

    const finalAvailableYears = selectedList
        ? Array.from(yearsByList.get(selectedList) || []).sort((a, b) => b.localeCompare(a))
        : sortedYears;

    // Transitions sorting
    let trArray = Array.from(transMap.values());
    
    const compareElectedCounts = (a, b) => {
        const electedA = a.history.filter(h => h.elected).length;
        const electedB = b.history.filter(h => h.elected).length;
        if (electedB !== electedA) return electedB - electedA;
        
        // Tie-breaker: Importance of categories (CD > Fiscal > Asamblea)
        const sA = {
          cd: getCatStats(a.history, 'Comisión Directiva'),
          f: getCatStats(a.history, 'Fiscalizadora'),
          as: getCatStats(a.history, 'Asamblea')
        };
        const sB = {
          cd: getCatStats(b.history, 'Comisión Directiva'),
          f: getCatStats(b.history, 'Fiscalizadora'),
          as: getCatStats(b.history, 'Asamblea')
        };
        if (sB.cd.elected !== sA.cd.elected) return sB.cd.elected - sA.cd.elected;
        if (sB.cd.total !== sA.cd.total) return sB.cd.total - sA.cd.total;
        if (sB.f.elected !== sA.f.elected) return sB.f.elected - sA.f.elected;
        return a.name.localeCompare(b.name);
    };

    if (sortModePases === 'importance') {
        trArray.sort(compareElectedCounts);
    } else if (sortModePases === 'mostLists') {
        trArray.sort((a, b) => b.totalLists - a.totalLists || a.name.localeCompare(b.name));
    } else {
        trArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    // BoardConfigs (Conformaciones) aggregation format
    const currentCatMap = boardMap[selectedBoardCategory] || new Map();
    const currentMembersMap = boardMembersMap[selectedBoardCategory] || new Map();

    const aggregatedBoards = Array.from(currentCatMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Descending years
        .map(([year, listCounts]) => {
            const listsDetails = Array.from(listCounts.entries())
                .sort((a, b) => b[1] - a[1]) // Descending by member count
                .map(([listName, count]) => ({ listName, count }));
                
            return {
                year,
                totalMembers: listsDetails.reduce((sum, item) => sum + item.count, 0),
                lists: listsDetails,
                members: (currentMembersMap.get(year) || []).sort((a, b) => a.name.localeCompare(b.name))
            };
        });
    return {
      filteredCandidates: sorted,
      uniqueLists: finalAvailableLists,
      uniqueYears: finalAvailableYears,
      globalListsCount: lists.size,
      globalElectedCount: new Set(
          data.filter(c => c.history.some(h => h.elected)).map(c => c.name)
      ).size,
      sortedTransitions: trArray,
      boardConfigs: aggregatedBoards
    };
  }, [data, searchTerm, selectedList, selectedYear, selectedCategory, sortMode, sortModePases, onlyElected, selectedBoardCategory]);

  useEffect(() => {
    setSelectedBoardYear(null);
  }, [activeTab, selectedBoardCategory]);

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff'}}>Cargando...</div>;
  }

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / candidatesPerPage));
  const currentCandidates = filteredCandidates.slice((currentPage - 1) * candidatesPerPage, currentPage * candidatesPerPage);

  const totalPasesPages = Math.max(1, Math.ceil(sortedTransitions.length / pasesPerPage));
  const currentPases = sortedTransitions.slice((pasesPage - 1) * pasesPerPage, pasesPage * pasesPerPage);

  // Grouping function for candidate card: returns [{ category, lists: [{ list, items }] }]
  const getCategorizedGroups = (history) => {
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
           {lastUpdated && (
             <div className="last-updated-tag">
               <RotateCw size={14} />
               <span>Sincronizado: {lastUpdated}</span>
             </div>
           )}
        </div>

        <h1 className="header-title">
          MAPA DE CANDIDATOS
          <small className="header-title-org">CLUB ATLETICO SAN LORENZO DE ALMAGRO</small>
        </h1>
        <p className="header-subtitle">
          Análisis e histórico de participaciones políticas en el club
        </p>


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
            <p>{globalListsCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981'}}>
            <ShieldCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>Personas Electas</h3>
            <p>{globalElectedCount}</p>
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
          Conformación de Órganos de Gob.
        </button>
      </div>

      {activeTab === 'candidates' && (
        <>
          <section className="search-section">
            <div className="filters-main-layout">
              <div className="search-input-group">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={24} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Buscar por nombre de candidato..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filters-grid">
                <div className="filter-control">
                  <span className="filter-label">Año Electoral</span>
                  <select 
                    className="dropdown-filter"
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todos los Años</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                
                <div className="filter-control">
                  <span className="filter-label">Agrupación Política</span>
                  <select 
                    className="dropdown-filter"
                    value={selectedList}
                    onChange={(e) => { setSelectedList(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas las Agrupaciones</option>
                    {uniqueLists.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="filter-control">
                  <span className="filter-label">Cargo / Órgano</span>
                  <select 
                    className="dropdown-filter"
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todos los Cargos</option>
                    <option value="Comisión Directiva">Comisión Directiva</option>
                    <option value="Fiscalizadora">Fiscalizadora</option>
                    <option value="Asamblea">Asamblea</option>
                  </select>
                </div>

                <div className="filter-control">
                  <span className="filter-label">Ordenar por</span>
                  <select 
                    className="dropdown-filter"
                    value={sortMode}
                    onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="mostLists">Participación Política</option>
                    <option value="alpha">Nombre (A-Z)</option>
                  </select>
                </div>

                <div className="filter-control checkbox-control">
                  <label className="filter-checkbox-styled">
                    <input 
                      type="checkbox" 
                      checked={onlyElected}
                      onChange={(e) => { setOnlyElected(e.target.checked); setCurrentPage(1); }}
                    />
                    <div className="checkbox-box">
                      {onlyElected && <CheckCircle2 size={14} />}
                    </div>
                    <span>Solo Electos</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="legend-strip">
                <span className="legend-dot"></span>
                Años en rojo: El candidato resultó electo
            </div>
          </section>

          <section className="candidates-grid">
            <AnimatePresence mode="popLayout">
              {currentCandidates.map((c, idx) => {
                const categoryGroups = getCategorizedGroups(c.history);
                const mainList = categoryGroups[0]?.lists[0]?.list || '';

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
                        {categoryGroups.map((cat, catIdx) => (
                           <div key={catIdx} className="category-block">
                              <h4 className="category-tag">{cat.category}</h4>
                              {cat.lists.map((g, gIndex) => (
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
                     <option value="importance">Más veces electo</option>
                     <option value="mostLists">Agrupaciones Cambiadas</option>
                     <option value="alpha">Orden Alfabético</option>
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
              <div style={{marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem'}}>
                 <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      {selectedBoardYear && (
                        <button className="back-button" onClick={() => setSelectedBoardYear(null)}>
                          <ChevronLeft size={20} />
                          Volver
                        </button>
                      )}
                      <h2 style={{fontFamily: 'var(--font-heading)'}}>
                        {selectedBoardYear ? `Elecciones ${selectedBoardYear}` : 'Conformación de Órganos de Gob.'}
                      </h2>
                    </div>
                    <p style={{color: 'var(--text-muted)'}}>
                      {selectedBoardYear 
                        ? `${selectedBoardCategory} - Integrantes electos` 
                        : 'Integrantes electos desglosados por agrupación política.'}
                    </p>
                 </div>
                 {!selectedBoardYear && (
                   <div className="category-selector">
                      {['Comisión Directiva', 'Asamblea', 'Fiscalizadora'].map(cat => (
                        <button 
                          key={cat}
                          className={`mini-tab ${selectedBoardCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedBoardCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                 )}
              </div>

              {!selectedBoardYear ? (
                <div className="board-years-grid">
                    {boardConfigs.map((bc, idx) => (
                        <motion.div 
                           key={bc.year}
                           className="board-card clickable"
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: idx * 0.05 }}
                           onClick={() => setSelectedBoardYear(bc.year)}
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
                           <div className="board-card-footer">
                              <span>Ver integrantes <ArrowRightLeft size={12} style={{transform: 'rotate(90deg)'}} /></span>
                           </div>
                        </motion.div>
                    ))}
                </div>
              ) : (
                <div className="board-detail-view">
                   {(() => {
                     const board = boardConfigs.find(b => b.year === selectedBoardYear);
                     if (!board) return null;
                     
                     // Get counts per list for sorting
                     const listImportance = {};
                     board.members.forEach(m => {
                       listImportance[m.list] = (listImportance[m.list] || 0) + 1;
                     });
                     
                     const sortedMembers = [...board.members].sort((a, b) => {
                       if (listImportance[b.list] !== listImportance[a.list]) {
                         return listImportance[b.list] - listImportance[a.list];
                       }
                       return a.name.localeCompare(b.name);
                     });

                     return sortedMembers.map((member, idx) => (
                       <motion.div 
                          key={member.name}
                          className="member-item"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.01 }}
                       >
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="member-list" style={{color: getListColor(member.list)}}>{member.list}</span>
                          </div>
                          
                          <div className="member-tooltip">
                            <div className="tooltip-header">Resumen Político</div>
                            <div className="tooltip-content">
                              <div className="tooltip-stat">
                                <span>Participaciones:</span>
                                <strong>{member.history.length}</strong>
                              </div>
                              <div className="tooltip-stat">
                                <span>Elecciones electo:</span>
                                <strong style={{color: 'var(--rojo-casla)'}}>{member.history.filter(h => h.elected).length}</strong>
                              </div>
                              <div className="tooltip-section-title">Trayectoria:</div>
                              <div className="tooltip-history-list">
                                {member.history.map((h, i) => (
                                  <div key={i} className={`tooltip-history-item ${h.elected ? 'elected' : ''}`}>
                                    <span>{h.year}</span>
                                    <span>{h.list}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                       </motion.div>
                     ));
                   })()}
                </div>
              )}
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
