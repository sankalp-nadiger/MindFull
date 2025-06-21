import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

/**
 * Example component demonstrating multilingual support implementation
 * This component shows how to:
 * 1. Use translations in components
 * 2. Handle language changes
 * 3. Support RTL languages
 * 4. Format dates and numbers based on locale
 */
const MultilingualExample = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL, getCurrentLanguageData } = useLanguageContext();

  const currentLangData = getCurrentLanguageData();
  const currentDate = new Date();
  const sampleNumber = 1234.56;

  // Format date according to current locale
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Format number according to current locale
  const formatNumber = (number) => {
    return new Intl.NumberFormat(currentLanguage).format(number);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isRTL() ? 'text-right' : 'text-left'}`}>
      {/* Header with language selector */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('homepage.title')}
        </h1>
        <LanguageSelector />
      </div>

      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          {t('auth.welcomeBack')}
        </h2>
        <p className="text-lg">
          {t('homepage.description')}
        </p>
      </div>

      {/* Language information */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('common.language')} {t('settings.title')}
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>{t('common.language')}:</strong> {currentLangData.nativeName} ({currentLangData.name})
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Code:</strong> {currentLanguage}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Direction:</strong> {isRTL() ? 'Right-to-Left' : 'Left-to-Right'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Localization Examples
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>{t('dashboard.todaysQuote')}:</strong> {formatDate(currentDate)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Number Format:</strong> {formatNumber(sampleNumber)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation examples */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t('navigation.home')} {t('navigation.dashboard')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'navigation.home',
            'navigation.dashboard',
            'navigation.community',
            'navigation.activities',
            'navigation.journals',
            'navigation.counsellor',
            'navigation.profile',
            'navigation.settings'
          ].map((key) => (
            <button
              key={key}
              className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Common actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t('common.actions', { defaultValue: 'Common Actions' })}
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            'common.save',
            'common.cancel',
            'common.edit',
            'common.delete',
            'common.submit',
            'common.back',
            'common.next'
          ].map((key) => (
            <button
              key={key}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Implementation notes */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Implementation Notes:
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Use {'{t("key")}'} for all user-facing text</li>
          <li>• Import useTranslation hook in each component</li>
          <li>• Handle RTL languages with conditional CSS classes</li>
          <li>• Format dates and numbers according to locale</li>
          <li>• Provide fallback values for missing translations</li>
        </ul>
      </div>
    </div>
  );
};

export default MultilingualExample;
