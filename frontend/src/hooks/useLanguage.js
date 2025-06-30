import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '../i18n/languages';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    
    // Update document direction for RTL languages
    if (RTL_LANGUAGES.includes(langCode)) {
      document.dir = 'rtl';
      document.documentElement.setAttribute('lang', langCode);
    } else {
      document.dir = 'ltr';
      document.documentElement.setAttribute('lang', langCode);
    }
  };

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(
      lang => lang.code === i18n.language
    ) || SUPPORTED_LANGUAGES[0];
  };

  const isRTL = () => {
    return RTL_LANGUAGES.includes(i18n.language);
  };

  // Initialize document direction on mount
  useEffect(() => {
    const currentLang = i18n.language;
    if (RTL_LANGUAGES.includes(currentLang)) {
      document.dir = 'rtl';
    } else {
      document.dir = 'ltr';
    }
    document.documentElement.setAttribute('lang', currentLang);
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    t
  };
};
