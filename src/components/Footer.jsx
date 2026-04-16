import React from 'react';
import { Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-credits">
          Vibecodeado por: <a href="https://x.com/chagasalo" target="_blank" rel="noopener noreferrer">Gonzalo Suarez (@chagasalo)</a> & Antigravity AI.
        </p>
        <a href="https://github.com/chagasalo/HistoricoCD_SL" target="_blank" rel="noopener noreferrer" className="footer-repo-link">
          <Github size={18} />
          <span>Ver código en GitHub</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
