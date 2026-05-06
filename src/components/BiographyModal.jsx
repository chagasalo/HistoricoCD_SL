import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';

const BiographyModal = ({ isOpen, onClose, candidate }) => {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-overlay"
          />
          
          {/* Modal Container */}
          <div className="modal-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="biography-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="header-title-wrapper">
                  <BookOpen size={24} className="header-icon" />
                  <h2>Biografía</h2>
                </div>
                <button onClick={onClose} className="close-modal-btn">
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <h3 className="candidate-name-modal">{candidate.name}</h3>
                <div className="bio-scroll-area">
                  {candidate.biography.split('\n').map((paragraph, i) => (
                    <p key={i} className="bio-paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={onClose} className="footer-close-btn">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BiographyModal;
