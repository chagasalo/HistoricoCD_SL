import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  BookOpen, 
  History, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar,
  ArrowRightLeft,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { getListColor } from '../utils/colors';

const CandidateProfile = ({ candidate, onClose }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [candidate]);

  if (!candidate) return null;

  const totalElected = candidate.history.filter(h => h.elected).length;
  const uniqueLists = new Set(candidate.history.map(h => h.list)).size;
  const yearsActive = candidate.history.length;

  const sortedHistory = [...candidate.history].sort((a, b) => a.year.localeCompare(b.year));
  const transitions = [];
  for (let i = 1; i < sortedHistory.length; i++) {
    if (sortedHistory[i].list !== sortedHistory[i-1].list) {
      transitions.push({
        from: sortedHistory[i-1],
        to: sortedHistory[i]
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="candidate-profile-section"
    >
      <div className="profile-top-nav">
        <button onClick={onClose} className="back-to-explorer">
          <ArrowLeft size={20} />
          Volver al Explorador
        </button>
      </div>

      <div className="profile-header-main">
        <div className="profile-header-content">
          <h1 className="profile-name">{candidate.name}</h1>
          <div className="profile-badges">
            <span className="badge-item primary">
              <Award size={16} />
              {totalElected} Veces Electo
            </span>
            <span className="badge-item">
              <Users size={16} />
              {uniqueLists} Agrupaciones
            </span>
            <span className="badge-item">
              <Calendar size={16} />
              {yearsActive} Elecciones
            </span>
          </div>
        </div>
      </div>

      <div className="profile-content-layout">
        {/* Sidebar Stats */}
        <div className="profile-sidebar">
          <section className="profile-section-card">
            <div className="section-header-mini">
              <TrendingUp size={18} />
              <h3>Resumen de Carrera</h3>
            </div>
            <div className="stats-mini-grid">
              <div className="stat-box">
                <span className="stat-val">{yearsActive}</span>
                <span className="stat-lbl">Participaciones</span>
              </div>
              <div className="stat-box highlights">
                <span className="stat-val">{totalElected}</span>
                <span className="stat-lbl">Electo</span>
              </div>
            </div>
          </section>

          {transitions.length > 0 && (
            <section className="profile-section-card pases-summary">
              <div className="section-header-mini">
                <ArrowRightLeft size={18} />
                <h3>Saltos Políticos</h3>
              </div>
              <div className="pases-mini-list">
                {transitions.map((t, i) => (
                  <div key={i} className="pase-mini-item">
                    <span className="year-mini">{t.to.year}</span>
                    <div className="pase-flow">
                      <span className="list-sm" style={{color: getListColor(t.from.list)}}>{t.from.list}</span>
                      <ArrowDown size={10} className="text-muted-foreground opacity-50" />
                      <span className="list-sm" style={{color: getListColor(t.to.list)}}>{t.to.list}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Main Content */}
        <div className="profile-main-content">
          {candidate.biography && (
            <section className="profile-main-section">
              <div className="section-title">
                <BookOpen size={20} />
                <h2>Biografía Profesional</h2>
              </div>
              <div className="profile-bio-text">
                {candidate.biography.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <section className="profile-main-section">
            <div className="section-title">
              <History size={20} />
              <h2>Trayectoria Detallada</h2>
            </div>
            <div className="profile-timeline">
              {[...sortedHistory].reverse().map((h, i) => (
                <div key={i} className={`timeline-entry ${h.elected ? 'is-elected' : ''}`}>
                  <div className="timeline-marker">
                     <div className="marker-dot" style={{backgroundColor: getListColor(h.list)}}></div>
                     <div className="marker-line"></div>
                  </div>
                  <div className="timeline-content-card">
                    <div className="timeline-date-row">
                      <span className="timeline-year">{h.year}</span>
                      {h.elected && <span className="elected-label">ELECTO</span>}
                    </div>
                    <div className="timeline-info">
                      <h4 className="timeline-list" style={{color: getListColor(h.list)}}>{h.list}</h4>
                      <p className="timeline-pos">{h.position || 'Candidato'}</p>
                      {h.category && <span className="timeline-cat">{h.category}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateProfile;
