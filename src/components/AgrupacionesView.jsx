import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Award, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { getListColor } from '../utils/colors';

const AgrupacionesView = ({ 
  agrupaciones = {}, 
  candidates = [], 
  highlightedAgrupacion = null,
  setHighlightedAgrupacion = () => {},
  onSelectAgrupacionFilter = () => {} 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const cardRefs = useRef({});

  // Dynamic statistics calculation per grouping
  const agrupacionesStats = useMemo(() => {
    const stats = {};
    candidates.forEach(c => {
      const groupsSeen = new Set();
      const groupsElectedSeen = new Set();
      
      c.history.forEach(h => {
        if (!h.list) return;
        groupsSeen.add(h.list);
        if (h.elected) {
          groupsElectedSeen.add(h.list);
        }
      });
      
      groupsSeen.forEach(grp => {
        if (!stats[grp]) {
          stats[grp] = { totalCandidates: 0, totalElected: 0 };
        }
        stats[grp].totalCandidates += 1;
      });
      
      groupsElectedSeen.forEach(grp => {
        if (!stats[grp]) {
          stats[grp] = { totalCandidates: 0, totalElected: 0 };
        }
        stats[grp].totalElected += 1;
      });
    });
    return stats;
  }, [candidates]);

  // Transform agrupaciones dictionary to a list and enrich with statistics
  const listAgrupaciones = useMemo(() => {
    return Object.entries(agrupaciones).map(([name, description]) => {
      const stats = agrupacionesStats[name] || { totalCandidates: 0, totalElected: 0 };
      return {
        name,
        description,
        ...stats
      };
    }).sort((a, b) => b.totalCandidates - a.totalCandidates || a.name.localeCompare(b.name));
  }, [agrupaciones, agrupacionesStats]);

  // Filter list by search term
  const filteredAgrupaciones = useMemo(() => {
    if (!searchTerm.trim()) return listAgrupaciones;
    const lower = searchTerm.toLowerCase();
    return listAgrupaciones.filter(a => 
      a.name.toLowerCase().includes(lower) || 
      a.description.toLowerCase().includes(lower)
    );
  }, [listAgrupaciones, searchTerm]);

  // Scroll into view if there's a highlighted grouping
  useEffect(() => {
    if (highlightedAgrupacion) {
      const targetRef = cardRefs.current[highlightedAgrupacion];
      if (targetRef) {
        const timer = setTimeout(() => {
          targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);

        // Remove the highlight after 4 seconds
        const resetTimer = setTimeout(() => {
          setHighlightedAgrupacion(null);
        }, 4000);

        return () => {
          clearTimeout(timer);
          clearTimeout(resetTimer);
        };
      }
    }
  }, [highlightedAgrupacion, setHighlightedAgrupacion]);

  return (
    <div className="agrupaciones-container">
      {/* Search Header */}
      <section className="search-section">
        <div className="filters-main-layout">
          <div className="search-input-group" style={{ width: '100%' }}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar agrupación por nombre, palabras clave, coaliciones..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="legend-strip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} className="text-amber-500" />
          <span>Explora la trayectoria y reseñas de las agrupaciones políticas históricas de San Lorenzo.</span>
        </div>
      </section>

      {/* Grid of Cards */}
      <motion.div 
        layout 
        className="agrupaciones-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredAgrupaciones.map((a, idx) => {
            const listColor = getListColor(a.name);
            const isHighlighted = highlightedAgrupacion === a.name;

            return (
              <motion.div
                layout
                key={a.name}
                id={`agrupacion-card-${a.name}`}
                ref={el => cardRefs.current[a.name] = el}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx > 15 ? 0 : idx * 0.03 }}
                className={`agrupacion-card ${isHighlighted ? 'highlighted-glow' : ''}`}
                style={{ 
                  borderTop: `4px solid ${listColor}`
                }}
              >
                <div className="agrupacion-card-header">
                  <h3 className="agrupacion-card-title" style={{ color: 'var(--text-main)' }}>
                    {a.name}
                  </h3>
                  {isHighlighted && (
                    <span className="highlight-tag">
                      Enfocado
                    </span>
                  )}
                </div>

                <div className="agrupacion-card-content">
                  <p className="agrupacion-desc">{a.description}</p>
                </div>

                <div className="agrupacion-card-footer-layout">
                  {/* Dynamic stats */}
                  <div className="agrupacion-stats-container">
                    <div className="agrupacion-stat-badge" title="Total de candidatos que integraron esta lista">
                      <Users size={12} style={{ color: listColor }} />
                      <span>{a.totalCandidates} {a.totalCandidates === 1 ? 'Candidato' : 'Candidatos'}</span>
                    </div>
                    {a.totalElected > 0 && (
                      <div className="agrupacion-stat-badge elected" title="Candidatos de esta lista que resultaron electos">
                        <Award size={12} style={{ color: 'var(--rojo-casla)' }} />
                        <span>{a.totalElected} {a.totalElected === 1 ? 'Electo' : 'Electos'}</span>
                      </div>
                    )}
                  </div>

                  {/* Redirection Button */}
                  <button 
                    className="ver-candidatos-btn"
                    style={{ 
                      '--hover-bg': `${listColor}15`,
                      '--hover-text': listColor
                    }}
                    onClick={() => onSelectAgrupacionFilter(a.name)}
                  >
                    <span>Ver candidatos de la agrupación</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredAgrupaciones.length === 0 && (
        <div className="empty-state-container" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No se encontraron agrupaciones</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Prueba buscando con otros términos o palabras clave.</p>
        </div>
      )}
    </div>
  );
};

export default AgrupacionesView;
