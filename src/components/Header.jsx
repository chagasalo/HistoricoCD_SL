import React from 'react';
import { Twitter, RotateCw } from 'lucide-react';

const Header = ({ lastUpdated }) => {
  return (
    <header className="header">
      <div className="header-actions">
         <a 
           href="https://x.com/mariano_casla99" 
           target="_blank" 
           rel="noopener noreferrer" 
           className="action-button twitter-button"
           title="Data por @mariano_casla99"
         >
           <Twitter size={18} />
           <span>@mariano_casla99</span>
         </a>
         {lastUpdated && (
           <div className="last-updated-tag">
             <RotateCw size={14} />
             <span>Sincronizado: {lastUpdated}</span>
           </div>
         )}
      </div>

      <h1 className="header-title">
        MAPA DE CANDIDATOS
        <small className="header-title-org">CLUB ATLETICO SAN LORENZO DE ALMAGRO</small>
      </h1>
      <p className="header-subtitle">
        Análisis e histórico de participaciones políticas en el club
      </p>
    </header>
  );
};

export default Header;
