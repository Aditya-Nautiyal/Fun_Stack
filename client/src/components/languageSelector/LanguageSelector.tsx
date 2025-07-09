import React, { useState } from 'react';
import './LanguageSelector.css';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'Spanish' },
  { code: 'es', label: 'French' },
];

const LanguageSelector = ({ defaultLanguage = 'en', onChange }) => {
  const [selected, setSelected] = useState(defaultLanguage);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (lang) => {
    setSelected(lang.code);
    setIsOpen(false);
    onChange(lang.code);
  };

  return (
    <div className="language-selector">
      <div className="language-selector-header" onClick={() => setIsOpen(!isOpen)}>
        {languages.find((lang) => lang.code === selected)?.label}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <ul className="language-selector-list">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className={`language-selector-item ${selected === lang.code ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
            >
              {lang.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
