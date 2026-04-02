import { createContext, useContext, useState } from 'react';
import translations from '../i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('vaqt_lang') || 'uz');

  const t = (key) => translations[lang][key] ?? translations['uz'][key] ?? key;

  const toggleLang = () => {
    const next = lang === 'uz' ? 'ru' : 'uz';
    setLang(next);
    localStorage.setItem('vaqt_lang', next);
  };

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
