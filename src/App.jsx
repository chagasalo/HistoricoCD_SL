import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import TabNavigation from './components/TabNavigation';
import CandidateExplorer from './components/CandidateExplorer';
import TransitionView from './components/TransitionView';
import ElectionResultsView from './components/ElectionResultsView';
import GovernanceBoardView from './components/GovernanceBoardView';
import CandidateProfile from './components/CandidateProfile';
import AgrupacionesView from './components/AgrupacionesView';
import Footer from './components/Footer';

export const PERIODS = [
  { id: '1996-2026', label: '1996 - 2026', min: 1996, max: 2026 },
  { id: '1966-1995', label: '1966 - 1995', min: 1966, max: 1995 },
  { id: '1940-1965', label: '1940 - 1965', min: 1940, max: 1965 }
];

export default function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1996-2026');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('candidates'); 
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [electionResults, setElectionResults] = useState([]);
  const [agrupaciones, setAgrupaciones] = useState({});
  const [highlightedAgrupacion, setHighlightedAgrupacion] = useState(null);

  // Profile View State
  const [selectedProfileCandidate, setSelectedProfileCandidate] = useState(null);

  const openProfile = (candidate) => {
    setSelectedProfileCandidate(candidate);
    setActiveTab('profile');
  };

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
      
      if (hash.startsWith('profile/')) {
        const candidateName = decodeURIComponent(hash.split('profile/')[1]);
        const found = data.find(c => c.name === candidateName);
        if (found) {
          setSelectedProfileCandidate(found);
          setActiveTab('profile');
          return;
        }
      }

      if (hash.startsWith('agrupaciones/')) {
        const listName = decodeURIComponent(hash.split('agrupaciones/')[1]);
        setHighlightedAgrupacion(listName);
        setActiveTab('agrupaciones');
        setSelectedProfileCandidate(null);
        return;
      }

      if (['candidates', 'agrupaciones', 'transitions', 'conformaciones', 'elecciones'].includes(hash)) {
        setActiveTab(hash);
        setSelectedProfileCandidate(null);
        if (hash !== 'agrupaciones') {
          setHighlightedAgrupacion(null);
        }
      }
    };

    if (data.length > 0) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [data]);

  useEffect(() => {
    if (activeTab === 'profile' && selectedProfileCandidate) {
      window.location.hash = `profile/${encodeURIComponent(selectedProfileCandidate.name)}`;
    } else if (activeTab === 'agrupaciones' && highlightedAgrupacion) {
      window.location.hash = `agrupaciones/${encodeURIComponent(highlightedAgrupacion)}`;
    } else {
      window.location.hash = activeTab;
    }
  }, [activeTab, selectedProfileCandidate, highlightedAgrupacion]);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setData(json);
        } else if (json && json.candidates) {
          setData(json.candidates);
          if (json.agrupaciones) {
            setAgrupaciones(json.agrupaciones);
          }
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

  useEffect(() => {
    fetch('/election_results.json')
      .then(res => res.json())
      .then(json => setElectionResults(json))
      .catch(err => console.error('Failed to load election results:', err));
  }, []);

  useEffect(() => {
     setCurrentPage(1);
  }, [searchTerm, selectedList, selectedYear, selectedCategory, sortMode, onlyElected]);

  useEffect(() => {
     setPasesPage(1);
  }, [sortModePases]);

  useEffect(() => {
    setSelectedYear('');
    setCurrentPage(1);
  }, [selectedPeriod]);

  const processedStaticData = useMemo(() => {
    const lists = new Set();
    const years = new Set();
    const transMap = new Map(); 
    
    const boardMap = {
      'Comisión Directiva': new Map(),
      'Asamblea': new Map(),
      'Fiscalizadora': new Map(),
      'Junta Electoral': new Map(),
      'Tribunal de Ética': new Map()
    };
    
    const boardMembersMap = {
      'Comisión Directiva': new Map(),
      'Asamblea': new Map(),
      'Fiscalizadora': new Map(),
      'Junta Electoral': new Map(),
      'Tribunal de Ética': new Map()
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

      const listCountMap = new Map();
      sortedHistory.forEach(h => listCountMap.set(h.list, (listCountMap.get(h.list) || 0) + 1));

      if (transMap.has(c.name)) {
         const entry = transMap.get(c.name);
         entry.totalLists = userLists.size;
         entry.listCounts = Object.fromEntries(listCountMap);
         entry.moves.sort((a, b) => b.toYear.localeCompare(a.toYear));
      }
    });

    const globalElectedCount = new Set(data.filter(c => c.history.some(h => h.elected)).map(c => c.name)).size;
    const sortedYears = Array.from(years).filter(y => y).sort((a, b) => b.localeCompare(a));

    return {
      lists,
      years,
      transMap,
      boardMap,
      boardMembersMap,
      listsByYear,
      yearsByList,
      globalElectedCount,
      sortedYears
    };
  }, [data]);

  const uniqueLists = useMemo(() => {
    return selectedYear 
        ? Array.from(processedStaticData.listsByYear.get(selectedYear) || []).sort()
        : Array.from(processedStaticData.lists).sort();
  }, [processedStaticData, selectedYear]);

  const uniqueYears = useMemo(() => {
    const years = selectedList
        ? Array.from(processedStaticData.yearsByList.get(selectedList) || []).sort((a, b) => b.localeCompare(a))
        : processedStaticData.sortedYears;
    if (selectedPeriod === 'all') {
      return years;
    }
    const period = PERIODS.find(p => p.id === selectedPeriod);
    return years.filter(y => {
      const yr = parseInt(y.match(/\d{4}/)?.[0]);
      return yr >= period.min && yr <= period.max;
    });
  }, [processedStaticData, selectedList, selectedPeriod]);

  const globalListsCount = processedStaticData.lists.size;
  const globalElectedCount = processedStaticData.globalElectedCount;

  const sortedTransitions = useMemo(() => {
    let trArray = Array.from(processedStaticData.transMap.values());
    const getCatStats = (history, cat) => {
      const entries = history.filter(h => (h.category || 'Comisión Directiva') === cat);
      return {
        total: entries.length,
        elected: entries.filter(h => h.elected).length
      };
    };
    const compareElectedCounts = (a, b) => {
        const electedA = a.history.filter(h => h.elected).length;
        const electedB = b.history.filter(h => h.elected).length;
        if (electedB !== electedA) return electedB - electedA;
        const sA = {
          cd: getCatStats(a.history, 'Comisión Directiva'),
          f: getCatStats(a.history, 'Fiscalizadora')
        };
        const sB = {
          cd: getCatStats(b.history, 'Comisión Directiva'),
          f: getCatStats(b.history, 'Fiscalizadora')
        };
        if (sB.cd.elected !== sA.cd.elected) return sB.cd.elected - sA.cd.elected;
        if (sB.cd.total !== sA.cd.total) return sB.cd.total - sA.cd.total;
        if (sB.f.elected !== sA.f.elected) return sB.f.elected - sA.f.elected;
        return a.name.localeCompare(b.name);
    };

    if (sortModePases === 'importance') trArray.sort(compareElectedCounts);
    else if (sortModePases === 'mostLists') trArray.sort((a, b) => b.totalLists - a.totalLists || a.name.localeCompare(b.name));
    else trArray.sort((a, b) => a.name.localeCompare(b.name));
    return trArray;
  }, [processedStaticData, sortModePases]);

  const boardConfigs = useMemo(() => {
    const currentCatMap = processedStaticData.boardMap[selectedBoardCategory] || new Map();
    const currentMembersMap = processedStaticData.boardMembersMap[selectedBoardCategory] || new Map();
    return Array.from(currentCatMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) 
        .map(([year, listCounts]) => {
            const listsDetails = Array.from(listCounts.entries())
                .sort((a, b) => b[1] - a[1]) 
                .map(([listName, count]) => ({ listName, count }));
            return {
                year,
                totalMembers: listsDetails.reduce((sum, item) => sum + item.count, 0),
                lists: listsDetails,
                members: (currentMembersMap.get(year) || []).sort((a, b) => a.name.localeCompare(b.name))
            };
        });
  }, [processedStaticData, selectedBoardCategory]);

  const filteredCandidates = useMemo(() => {
    const period = selectedPeriod !== 'all' ? PERIODS.find(p => p.id === selectedPeriod) : null;
    const filtered = data.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasHistoryMatch = c.history.some(h => {
        if (period) {
          const hYear = parseInt(h.year.match(/\d{4}/)?.[0]);
          if (isNaN(hYear) || hYear < period.min || hYear > period.max) return false;
        }
        if (selectedYear && h.year !== selectedYear) return false;
        if (selectedList && h.list !== selectedList) return false;
        if (onlyElected && !h.elected) return false;
        const hCat = h.category || 'Comisión Directiva';
        if (selectedCategory && hCat !== selectedCategory) return false;
        return true;
      });
      return matchesSearch && hasHistoryMatch;
    });

    const getCatStats = (history, cat) => {
      const entries = history.filter(h => (h.category || 'Comisión Directiva') === cat);
      return {
        total: entries.length,
        elected: entries.filter(h => h.elected).length
      };
    };

    return [...filtered].sort((a, b) => {
      if (sortMode === 'alpha') return a.name.localeCompare(b.name);
      
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

      if (statsB.cd.elected !== statsA.cd.elected) return statsB.cd.elected - statsA.cd.elected;
      if (statsB.cd.total !== statsA.cd.total) return statsB.cd.total - statsA.cd.total;
      if (statsB.f.elected !== statsA.f.elected) return statsB.f.elected - statsA.f.elected;
      if (statsB.f.total !== statsA.f.total) return statsB.f.total - statsA.f.total;
      if (statsB.as.elected !== statsA.as.elected) return statsB.as.elected - statsA.as.elected;
      if (statsB.as.total !== statsA.as.total) return statsB.as.total - statsA.as.total;
      
      return a.name.localeCompare(b.name);
    });
  }, [data, searchTerm, selectedList, selectedYear, selectedCategory, sortMode, onlyElected, selectedPeriod]);

  useEffect(() => {
    setSelectedBoardYear(null);
  }, [selectedBoardCategory]);

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff'}} aria-live="polite">Cargando…</div>;
  }

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / candidatesPerPage));
  const currentCandidates = filteredCandidates.slice((currentPage - 1) * candidatesPerPage, currentPage * candidatesPerPage);
  const totalPasesPages = Math.max(1, Math.ceil(sortedTransitions.length / pasesPerPage));
  const currentPases = sortedTransitions.slice((pasesPage - 1) * pasesPerPage, pasesPage * pasesPerPage);

  return (
    <div className="app-container">
      <Header lastUpdated={lastUpdated} />

      {activeTab !== 'profile' && (
        <>
          <StatsGrid 
            totalCandidates={data.length} 
            globalListsCount={globalListsCount} 
            globalElectedCount={globalElectedCount} 
          />
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      {activeTab === 'candidates' && (
        <CandidateExplorer 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedYear={selectedYear} setSelectedYear={setSelectedYear} uniqueYears={uniqueYears}
          selectedList={selectedList} setSelectedList={setSelectedList} uniqueLists={uniqueLists}
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          sortMode={sortMode} setSortMode={setSortMode}
          onlyElected={onlyElected} setOnlyElected={setOnlyElected}
          selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
          currentCandidates={currentCandidates}
          currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
          filteredCandidatesCount={filteredCandidates.length}
          onOpenBio={openProfile}
        />
      )}

      {activeTab === 'agrupaciones' && (
        <AgrupacionesView 
          agrupaciones={agrupaciones}
          candidates={data}
          highlightedAgrupacion={highlightedAgrupacion}
          setHighlightedAgrupacion={setHighlightedAgrupacion}
          onSelectAgrupacionFilter={(listName) => {
            setSearchTerm('');
            setSelectedYear('');
            setSelectedCategory('');
            setOnlyElected(false);
            setSelectedList(listName);
            setActiveTab('candidates');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {activeTab === 'transitions' && (
        <TransitionView 
          sortModePases={sortModePases} setSortModePases={setSortModePases}
          currentPases={currentPases} totalPasesPages={totalPasesPages}
          pasesPage={pasesPage} setPasesPage={setPasesPage}
        />
      )}

      {activeTab === 'elecciones' && (
        <ElectionResultsView 
          electionResults={electionResults}
          setSelectedBoardYear={setSelectedBoardYear}
          setSelectedBoardCategory={setSelectedBoardCategory}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'conformaciones' && (
        <GovernanceBoardView 
          selectedBoardYear={selectedBoardYear} setSelectedBoardYear={setSelectedBoardYear}
          selectedBoardCategory={selectedBoardCategory} setSelectedBoardCategory={setSelectedBoardCategory}
          boardConfigs={boardConfigs}
        />
      )}

      {activeTab === 'profile' && selectedProfileCandidate && (
        <CandidateProfile 
          candidate={selectedProfileCandidate} 
          onClose={() => {
            setSelectedProfileCandidate(null);
            setActiveTab('candidates');
          }} 
        />
      )}

      <Footer />
    </div>
  );
}
