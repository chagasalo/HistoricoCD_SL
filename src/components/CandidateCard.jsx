import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getListColor } from '../utils/colors';
import { getCategorizedGroups } from '../utils/helpers';

const CandidateCard = ({ candidate, sortMode, currentPage, idx, selectedYear, selectedList, selectedCategory, onlyElected }) => {
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
      <div className="candidate-header">
        <h3 className="candidate-name">{candidate.name}</h3>
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
                        {g.items.map((h, i) => {
                          const isPresi = h.position?.toLowerCase().includes('presidente') && !h.position?.toLowerCase().includes('vice');
                          const isVice = h.position?.toLowerCase().includes('vice-presidente') || h.position?.toLowerCase().includes('vicepresidente');
                          return (
                            <span key={i} className={`row-year ${h.elected ? 'elected' : ''}`}>
                              {h.year}
                              {isPresi && ' 🥇'}
                              {isVice && ' 🥈'}
                              {h.elected && <CheckCircle2 size={10} />}
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
