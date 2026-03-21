"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Locale = "en" | "zh";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

const translations: Record<Locale, Record<string, unknown>> = {
  en: {} as Record<string, unknown>,
  zh: {} as Record<string, unknown>,
};

// We'll load translations dynamically
async function loadTranslation(locale: Locale): Promise<Record<string, unknown>> {
  const mod = await import(`@/locales/${locale}.json`);
  return mod.default as Record<string, unknown>;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [dicts, setDicts] = useState<Record<Locale, Record<string, unknown>>>(translations);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("locale");
    if (saved === "zh" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    // Load translations for both locales
    loadTranslation("en").then((en) => {
      loadTranslation("zh").then((zh) => {
        setDicts({ en, zh });
      });
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const t = useCallback(
    (key: string) => {
      return getNestedValue(dicts[locale] as Record<string, unknown>, key);
    },
    [locale, dicts]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
