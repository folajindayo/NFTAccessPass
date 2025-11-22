import en from '@/locales/en.json';

export const useTranslation = () => {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t };
};

