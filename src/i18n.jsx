import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (v) => v });

function initialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);
  const value = useMemo(
    () => ({ lang, setLang, t: (v) => (v && typeof v === 'object' && 'en' in v ? v[lang] ?? v.en : v) }),
    [lang, setLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LangContext);
