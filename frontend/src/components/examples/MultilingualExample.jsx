import React, { useState, useRef } from 'react';
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
  const [showLang, setShowLang] = useState(false);
  const popoverTimeout = useRef();

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
    <div className={`mx-auto p-6 ${isRTL() ? 'text-right' : 'text-left'}`} style={{ backgroundColor: '#111111', minHeight: '100vh' }}>
      {/* Header with language selector - NO CONTAINER STYLING */}
      <div className="flex justify-end items-start mb-8">
        {/* Floating globe button for language selector with stable popover */}
        <div className="relative" onMouseLeave={() => {popoverTimeout.current = setTimeout(() => setShowLang(false), 120);}} onMouseEnter={() => {clearTimeout(popoverTimeout.current); setShowLang(true);}}>
          <button
            aria-label="Select Language"
            className="bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500 rounded-full p-3 shadow-lg transition-colors duration-200 focus:outline-none"
            onClick={() => setShowLang((v) => !v)}
            tabIndex={0}
            onBlur={() => setTimeout(() => setShowLang(false), 200)}
          >
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-80 max-w-xs z-50 animate-fade-in" onMouseEnter={() => {clearTimeout(popoverTimeout.current); setShowLang(true);}} onMouseLeave={() => {popoverTimeout.current = setTimeout(() => setShowLang(false), 120);}}>
              <LanguageSelector horizontal onClose={() => setShowLang(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Welcome section */}
      <div className="p-6 rounded-lg mb-6" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#ffffff' }}>
        <h2 className="text-2xl font-semibold mb-2">
          {t('auth.welcomeBack')}
        </h2>
        <p className="text-lg">
          {t('homepage.description')}
        </p>
      </div>

      {/* Language information */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1f1f1f', border: '1px solid #333333' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
            {t('common.language')} {t('settings.title')}
          </h3>
          <div className="space-y-2">
            <p style={{ color: '#cccccc' }}>
              <strong>{t('common.language')}:</strong> {currentLangData.nativeName} ({currentLangData.name})
            </p>
            <p style={{ color: '#cccccc' }}>
              <strong>Code:</strong> {currentLanguage}
            </p>
            <p style={{ color: '#cccccc' }}>
              <strong>Direction:</strong> {isRTL() ? 'Right-to-Left' : 'Left-to-Right'}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1f1f1f', border: '1px solid #333333' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
            Localization Examples
          </h3>
          <div className="space-y-2">
            <p style={{ color: '#cccccc' }}>
              <strong>{t('dashboard.todaysQuote')}:</strong> {formatDate(currentDate)}
            </p>
            <p style={{ color: '#cccccc' }}>
              <strong>Number Format:</strong> {formatNumber(sampleNumber)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation examples */}
      <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#1f1f1f', border: '1px solid #333333' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
          {t('navigation.home')} {t('navigation.dashboard')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'navigation.home',
            'navigation.dashboard',
            'navigation.community',
            'navigation.activities',
            'navigation.journals',
            'navigation.counselor',
            'navigation.profile',
            'navigation.settings'
          ].map((key) => (
            <button
              key={key}
              className="p-3 rounded-lg transition-colors"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Common actions */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1f1f1f', border: '1px solid #333333' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
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
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: '#333333',
                color: '#ffffff',
                border: '1px solid #555555',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444444';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#333333';
              }}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Implementation notes */}
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#2d1b00', border: '1px solid #8b5a00' }}>
        <h4 className="font-semibold mb-2" style={{ color: '#fbbf24' }}>
          Implementation Notes:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: '#f59e0b' }}>
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