import { useState, useEffect } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'es';

const locales = { en, es };

export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Ideally, we'd persist this or detect browser language
    const storedLocale = localStorage.getItem('app_locale') as Locale;
    if (storedLocale && locales[storedLocale]) {
      setLocale(storedLocale);
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('app_locale', newLocale);
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = locales[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, locale, changeLocale };
};
