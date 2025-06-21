import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import knTranslations from './locales/kn.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  kn: { translation: knTranslations }
};

const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
  excludeCacheFor: ['cimode'],
  lookupLocalStorage: 'i18nextLng',
  checkWhitelist: true
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: detectionOptions,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
    },
    
    // Backend options for loading translations from server
    backend: {
      loadPath: '/locales/{{lng}}.json',
      addPath: '/locales/{{lng}}/{{ns}}',
    },
    
    // Language whitelist
    supportedLngs: ['en', 'hi', 'kn'],
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Key separator
    keySeparator: '.',
    
    // Nesting separator
    nsSeparator: ':',
    
    // Load languages on init
    preload: ['en'],
    
    // Save missing keys
    saveMissing: true,
    saveMissingTo: 'current',
    
    // Update missing keys
    updateMissing: true,
  });

export default i18n;
