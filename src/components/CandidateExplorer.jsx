import React from 'react';
import { Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import CandidateCard from './CandidateCard';

const CandidateExplorer = ({
  searchTerm, setSearchTerm,
  selectedYear, setSelectedYear, uniqueYears,
  selectedList, setSelectedList, uniqueLists,
  selectedCategory, setSelectedCategory,
  sortMode, setSortMode,
  onlyElected, setOnlyElected,
  selectedPeriod, setSelectedPeriod,
  currentCandidates,
  currentPage, setCurrentPage, totalPages,
  filteredCandidatesCount,
  onOpenBio
}) => {
  return (
    <>
      <section className="search-section">
        <div className="period-pills-container" role="group" aria-label="Período de tiempo">
          {[
            { id: 'all', label: 'Todos' },
            { id: '1996-2026', label: '1996 - 2026 (Reciente)' },
            { id: '1966-1995', label: '1966 - 1995 (Medio)' },
            { id: '1940-1965', label: '1940 - 1965 (Histórico)' }
          ].map(p => (
            <button
              key={p.id}
              className={`period-pill ${selectedPeriod === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p.id)}
              aria-pressed={selectedPeriod === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="filters-main-layout">
          <div className="search-input-group">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} aria-hidden="true" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar por nombre de candidato… p. ej. Marcelo Moretti" 
                name="search"
                autoComplete="off"
                aria-label="Buscar por nombre de candidato"
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
                  {onlyElected && <CheckCircle2 size={14} aria-hidden="true" />}
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
          {currentCandidates.map((c, idx) => (
            <CandidateCard 
              key={c.name}
              candidate={c}
              sortMode={sortMode}
              currentPage={currentPage}
              idx={idx}
              selectedYear={selectedYear}
              selectedList={selectedList}
              selectedCategory={selectedCategory}
              onlyElected={onlyElected}
              onOpenBio={onOpenBio}
            />
          ))}
        </AnimatePresence>
      </section>
      
      {filteredCandidatesCount === 0 && (
        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
          No se encontraron candidatos.
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} aria-label="Página anterior"><ChevronLeft size={20} aria-hidden="true" /></button>
            <span>Página {currentPage} de {totalPages} ({filteredCandidatesCount} res.)</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} aria-label="Página siguiente"><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      )}
    </>
  );
};

export default CandidateExplorer;
