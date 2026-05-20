import React from 'react';
import { Users, Shield, ShieldCheck } from 'lucide-react';

const StatsGrid = ({ totalCandidates, globalListsCount, globalElectedCount }) => {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{backgroundColor: 'rgba(0, 45, 98, 0.4)'}}><Users size={28} /></div>
        <div className="stat-info">
          <h3>Candidatos Únicos</h3>
          <p>{totalCandidates}</p>
        </div>
      </div>
      <div 
        className="stat-card clickable"
        onClick={() => window.location.hash = '#agrupaciones'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.hash = '#agrupaciones';
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Ver listado de ${globalListsCount} agrupaciones`}
      >
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
  );
};

export default StatsGrid;
