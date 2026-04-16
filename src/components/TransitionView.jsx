import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getListColor } from '../utils/colors';

const TransitionView = ({ sortModePases, setSortModePases, currentPases, totalPasesPages, pasesPage, setPasesPage }) => {
  return (
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
                   key={t.name} 
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
  );
};

export default TransitionView;
