import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, RTL_LANGUAGES } from '../i18n/languages';

const LanguageContext = createContext();

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Initialize language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('i18nextLng');
    const browserLanguage = navigator.language.split('-')[0];
    
    const languageToUse = savedLanguage || 
      (SUPPORTED_LANGUAGES.find(lang => lang.code === browserLanguage)?.code) || 
      DEFAULT_LANGUAGE;

    changeLanguage(languageToUse);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
      
      // Update document properties
      if (RTL_LANGUAGES.includes(langCode)) {
        document.dir = 'rtl';
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.dir = 'ltr';
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      
      document.documentElement.setAttribute('lang', langCode);
      setCurrentLanguage(langCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguageData = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const isRTL = () => {
    return RTL_LANGUAGES.includes(currentLanguage);
  };

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    getCurrentLanguageData,
    isRTL,
    isLoading
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
