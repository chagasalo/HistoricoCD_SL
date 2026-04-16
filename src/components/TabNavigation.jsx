import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'candidates', label: 'Explorador de Candidatos' },
    { id: 'transitions', label: 'Mapa de Pases Históricos' },
    { id: 'elecciones', label: 'Resultados Históricos' },
    { id: 'conformaciones', label: 'Conformación de Órganos de Gob.' },
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
