import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BarChart3, ArrowRightLeft } from 'lucide-react';
import { getListColor } from '../utils/colors';
import { getCargoRank } from '../utils/helpers';

const GovernanceBoardView = ({ 
  selectedBoardYear, setSelectedBoardYear, 
  selectedBoardCategory, setSelectedBoardCategory, 
  boardConfigs 
}) => {
  return (
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
               
               const listImportance = {};
               board.members.forEach(m => {
                 listImportance[m.list] = (listImportance[m.list] || 0) + 1;
               });
               
               const sortedMembers = [...board.members].sort((a, b) => {
                 if (listImportance[b.list] !== listImportance[a.list]) {
                   return listImportance[b.list] - listImportance[a.list];
                 }
                 if (a.list !== b.list) {
                   return a.list.localeCompare(b.list);
                 }
                 const posA = a.history.find(h => h.year === selectedBoardYear && h.category === selectedBoardCategory)?.position;
                 const posB = b.history.find(h => h.year === selectedBoardYear && h.category === selectedBoardCategory)?.position;
                 const rankA = getCargoRank(posA);
                 const rankB = getCargoRank(posB);
                 if (rankA !== rankB) return rankA - rankB;
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
                       {(() => {
                         const cargo = member.history.find(h => h.year === selectedBoardYear && h.category === selectedBoardCategory)?.position;
                         const isPresi = cargo?.toLowerCase().includes('presidente') && !cargo?.toLowerCase().includes('vice');
                         const isVice = cargo?.toLowerCase().includes('vice-presidente') || cargo?.toLowerCase().includes('vicepresidente');
                         return cargo ? (
                           <div className="member-cargo-row">
                             <span className="member-cargo-prefix">Lugar en la lista: </span>
                             <span className="member-cargo-val">
                               {isPresi && '🥇 '}
                               {isVice && '🥈 '}
                               {cargo}
                             </span>
                           </div>
                         ) : null;
                       })()}
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
  );
};

export default GovernanceBoardView;
