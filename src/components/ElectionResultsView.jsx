import React from 'react';
import { motion } from 'framer-motion';
import { Vote, ArrowRightLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getListColor } from '../utils/colors';

const ElectionResultsView = ({ electionResults, setSelectedBoardYear, setSelectedBoardCategory, setActiveTab }) => {
  return (
    <section className="elecciones-section">
        <div className="elecciones-header">
            <div>
              <h2 style={{fontFamily: 'var(--font-heading)'}}>Histórico de Resultados Electorales</h2>
              <p style={{color: 'var(--text-muted)'}}>Desglose de votos y participación por período.</p>
            </div>
        </div>

        <div className="results-grid">
            {electionResults.map((election, idx) => {
                const isPending = election.year === '2026';
                const chartData = election.results
                    .filter(r => r.votos > 0 && r.agrupacion !== 'Padron de Socios')
                    .map(r => ({
                        name: r.agrupacion,
                        value: r.votos,
                        color: getListColor(r.agrupacion)
                    }));

                const participation = election.habilitados ? ((election.total / election.habilitados) * 100).toFixed(1) : null;

                return (
                    <motion.div 
                      key={election.title} 
                      className="election-result-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        if (!isPending) {
                            setSelectedBoardYear(election.year);
                            setSelectedBoardCategory('Comisión Directiva');
                            setActiveTab('conformaciones');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                        <div className="election-card-header">
                            <h3 className="election-year">{election.year === '2026' ? 'Mayo 2026' : `Diciembre ${election.year}`}</h3>
                            <span className={`election-type-tag ${election.title.includes('EXTRAORDINARIAS') ? 'extra' : 'ord'}`}>
                                {election.title.includes('EXTRAORDINARIAS') ? 'Extraordinaria' : 'Ordinaria'}
                            </span>
                        </div>

                        {isPending ? (
                            <div className="pending-election-box" style={{ padding: '2rem 1rem' }}>
                                <Vote size={32} />
                                <p style={{ fontSize: '1rem' }}>Elección Pendiente</p>
                                <small>Sin resultados oficiales aún</small>
                            </div>
                        ) : (
                            <div className="election-card-content">
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                              data={chartData}
                                              cx="50%"
                                              cy="50%"
                                              innerRadius={45}
                                              outerRadius={65}
                                              paddingAngle={5}
                                              dataKey="value"
                                              animationDuration={1500}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                              itemStyle={{ color: '#fff', padding: '2px 0' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-center-info">
                                        <span className="center-total" style={{ fontSize: '1.2rem' }}>{election.total.toLocaleString()}</span>
                                        <span className="center-label" style={{ fontSize: '0.6rem' }}>Votos</span>
                                    </div>
                                </div>

                                <div className="election-stats-summary">
                                    {participation && (
                                        <div className="participation-stat">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="stat-label">Participación</span>
                                                <span className="stat-value" style={{ fontSize: '1rem' }}>{participation}%</span>
                                            </div>
                                            <div className="stat-bar-bg">
                                                <div className="stat-bar-fill" style={{width: `${participation}%`}}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="winner-box" style={{ borderLeft: `4px solid ${getListColor(chartData[0]?.name)}`, padding: '0.75rem' }}>
                                        <span className="winner-label">Ganador</span>
                                        <span className="winner-name" style={{ fontSize: '0.9rem' }}>{chartData[0]?.name}</span>
                                        <span className="winner-candidate" style={{ fontSize: '0.75rem' }}>{election.results.find(r => r.agrupacion === chartData[0]?.name)?.presidente}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="view-board-btn"
                                    style={{ padding: '0.75rem', fontSize: '0.8rem', marginTop: '1rem' }}
                                >
                                    Ver Comisión Directiva <ArrowRightLeft size={12} style={{transform: 'rotate(90deg)'}} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    </section>
  );
};

export default ElectionResultsView;
