import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, ChevronRight } from 'lucide-react';
import { getListColor } from '../utils/colors';
import { getCategorizedGroups } from '../utils/helpers';

const CandidateCard = ({ candidate, sortMode, currentPage, idx, selectedYear, selectedList, selectedCategory, onlyElected, onOpenBio }) => {
  const displayHistory = candidate.history.filter(h => {
    if (selectedYear && h.year !== selectedYear) return false;
    if (selectedList && h.list !== selectedList) return false;
    if (selectedCategory && (h.category || 'Comisión Directiva') !== selectedCategory) return false;
    if (onlyElected && !h.elected) return false;
    return true;
  });
  
  const categoryGroups = getCategorizedGroups(displayHistory);
  const mainList = categoryGroups[0]?.lists[0]?.list || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: idx > 20 ? 0 : idx * 0.02 }}
      className="candidate-card"
      style={{ borderTop: `4px solid ${getListColor(mainList)}` }}
    >
      <div className="candidate-header" onClick={() => onOpenBio(candidate)} style={{ cursor: 'pointer' }}>
        <h3 className="candidate-name">{candidate.name}</h3>
        <button 
          className="bio-toggle-btn profile-trigger-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBio(candidate);
          }}
          title="Ver Perfil Completo"
          aria-label="Ver Perfil Completo"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      
      <div className="candidate-lists-container">
          {categoryGroups.map((cat, catIdx) => (
             <div key={catIdx} className="category-block">
                <h4 className="category-tag">{cat.category}</h4>
                {cat.lists.map((g, gIndex) => (
                  <div key={gIndex} className="candidate-list-row">
                      {g.list !== "(Sin datos)" && (
                        <button 
                          className="list-link-badge row-list-name" 
                          style={{ color: getListColor(g.list) }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.hash = `#agrupaciones/${encodeURIComponent(g.list)}`;
                          }}
                          title={`Ver reseña histórica de ${g.list}`}
                          aria-label={`Ver reseña histórica de ${g.list}`}
                        >
                          {g.list}
                        </button>
                      )}
                      <span className="row-years">
                        {g.items.map((h, i) => {
                          const isPresi = h.position?.toLowerCase().includes('presidente') && !h.position?.toLowerCase().includes('vice');
                          const isVice = h.position?.toLowerCase().includes('vice-presidente') || h.position?.toLowerCase().includes('vicepresidente');
                          return (
                            <span key={i} className={`row-year ${h.elected ? 'elected' : ''}`}>
                              {h.year}
                              {isPresi && ' 🥇'}
                              {isVice && ' 🥈'}
                              {h.elected && <CheckCircle2 size={10} aria-hidden="true" />}
                            </span>
                          );
                        })}
                      </span>
                  </div>
                ))}
             </div>
          ))}
      </div>
    </motion.div>
  );
};

export default CandidateCard;
