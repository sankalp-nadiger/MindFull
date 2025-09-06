import { useTranslation } from 'react-i18next';

/**
 * Translation utility functions and hooks
 */

// Custom hook for translations with error handling
export const useTranslations = (namespace) => {
  const { t, i18n } = useTranslation(namespace);
  
  const translate = (key, options = {}) => {
    try {
      return t(key, options);
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Fallback to key if translation fails
    }
  };

  return {
    t: translate,
    i18n,
    currentLanguage: i18n.language,
    isReady: i18n.isInitialized
  };
};

// HOC for wrapping components with translation
export const withTranslation = (Component, namespace) => {
  return function TranslatedComponent(props) {
    const translations = useTranslations(namespace);
    return <Component {...props} translations={translations} />;
  };
};

// Utility function to get nested translation
export const getNestedTranslation = (t, path, defaultValue = '') => {
  const keys = path.split('.');
  let result = '';
  
  try {
    result = t(path);
    if (result === path) {
      return defaultValue;
    }
    return result;
  } catch (error) {
    console.warn(`Failed to get translation for path: ${path}`);
    return defaultValue;
  }
};

// Format translation with parameters
export const formatTranslation = (t, key, params = {}) => {
  return t(key, params);
};

// Get translation for arrays/lists
export const getTranslationArray = (t, keyPrefix, count) => {
  const results = [];
  for (let i = 0; i < count; i++) {
    const key = `${keyPrefix}.${i}`;
    const translation = t(key);
    if (translation !== key) {
      results.push(translation);
    }
  }
  return results;
};

// Pluralization helper
export const pluralize = (t, key, count, options = {}) => {
  return t(key, { 
    count, 
    ...options 
  });
};

// Date/time localization
export const formatDate = (date, locale, options = {}) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(new Date(date));
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return date.toString();
  }
};

// Number localization
export const formatNumber = (number, locale, options = {}) => {
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.warn('Number formatting failed:', error);
    return number.toString();
  }
};

// Currency localization
export const formatCurrency = (amount, locale, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting failed:', error);
    return amount.toString();
  }
};

export default {
  useTranslations,
  withTranslation,
  getNestedTranslation,
  formatTranslation,
  getTranslationArray,
  pluralize,
  formatDate,
  formatNumber,
  formatCurrency
};
