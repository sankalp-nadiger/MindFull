import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

const LanguageSettings = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguageContext();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <div className={`max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${isRTL() ? 'text-right' : 'text-left'}`}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {t('settings.language')}
      </h2>
      
      <div className="space-y-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <div
            key={language.code}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              currentLanguage === language.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {language.nativeName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language.name}
                </div>
              </div>
              {currentLanguage === language.code && (
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 mt-6 rounded-lg bg-gray-50 dark:bg-gray-700">
        <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
          {t('settings.about')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('common.language')} settings will be saved automatically and applied across the entire application.
        </p>
      </div>
    </div>
  );
};

export default LanguageSettings;
