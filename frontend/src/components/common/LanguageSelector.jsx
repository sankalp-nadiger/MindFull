import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';

const LanguageSelector = ({ className = '', onClose }) => {
  const { i18n } = useTranslation();
  const [hovered, setHovered] = useState(null);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    if (langCode === 'ar') {
      document.dir = 'rtl';
    } else {
      document.dir = 'ltr';
    }
    if (onClose) onClose();
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <div
      className={`w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-xl relative flex flex-col items-center overflow-hidden ${className}`}
      style={{ minWidth: 260 }}
    >
      {/* Semicircle Close Button */}
      {onClose && (
        <div className="absolute top-0 right-0 w-10 h-8 flex items-start justify-end overflow-visible z-20">
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 bg-slate-800 border-b border-l border-slate-600 rounded-bl-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-slate-700 transition-colors duration-200 text-lg font-bold shadow"
            style={{ position: 'absolute', top: '-10px', right: '-2px', lineHeight: 1, padding: 0 }}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="flex flex-row gap-2 justify-center w-full mt-2">
        {SUPPORTED_LANGUAGES.map((language) => {
          const isSelected = language.code === i18n.language;
          return (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              onMouseEnter={() => setHovered(language.code)}
              onMouseLeave={() => setHovered(null)}
              className={`
                group flex flex-col items-center px-2 py-2 rounded-xl transition-colors duration-200 min-w-[70px] relative
                ${isSelected
                  ? 'bg-emerald-600 border border-emerald-400 shadow-lg shadow-emerald-500/20 flicker-on-hover'
                  : 'bg-slate-800 border border-slate-700 hover:bg-slate-700 flicker-on-hover'}
                focus:outline-none
              `}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              type="button"
              tabIndex={0}
            >
              <div className="flex flex-col items-center justify-center select-none w-full relative">
                <span className={`text-xs ${isSelected ? 'text-emerald-200' : 'text-gray-400'}`}>{language.nativeName}</span>
              </div>
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .flicker-on-hover:hover {
          animation: flicker 0.25s alternate 2;
        }
        @keyframes flicker {
          0% { filter: brightness(1.2) drop-shadow(0 0 2px #34d399); }
          50% { filter: brightness(2) drop-shadow(0 0 8px #34d399); }
          100% { filter: brightness(1.2) drop-shadow(0 0 2px #34d399); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;