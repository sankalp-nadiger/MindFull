import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bot, Sparkles, Heart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';

const FloatingChatButton = () => {
  const { t } = useTranslation();
  const [isBotHovered, setIsBotHovered] = useState(false);
  const [isLanguageHovered, setIsLanguageHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Stop pulsing after user interacts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 8000); // Stop pulsing after 8 seconds

    return () => clearTimeout(timer);
  }, []);

  // Hide message after some time
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setShowMessage(false);
    }, 5000); // Hide message after 5 seconds

    return () => clearTimeout(messageTimer);
  }, []);

  const handleChatClick = () => {
    setIsPulsing(false);
    setShowMessage(false);
  };

  // Hover handlers for language button
  const handleLanguageAreaEnter = () => {
    setIsLanguageHovered(true);
    setIsBotHovered(false);
  };

  const handleLanguageAreaLeave = () => {
    setIsLanguageHovered(false);
  };

  // Hover handlers for bot button
  const handleBotAreaEnter = () => {
    setIsBotHovered(true);
    setIsLanguageHovered(false);
    setIsPulsing(false);
  };

  const handleBotAreaLeave = () => {
    setIsBotHovered(false);
  };

  const handleLanguageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLanguageSelector(!showLanguageSelector);
  };

  return (
    <>
      <div className="fixed bottom-4 right-6 z-[9999]">
        {/* Language Selector Modal */}
        {showLanguageSelector && (
          <div className="absolute bottom-20 right-0 z-50 animate-fade-in">
            <LanguageSelector 
              className="w-full" 
              onClose={() => {
                setShowLanguageSelector(false);
                setIsLanguageHovered(false);
              }} 
            />
            <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 border-transparent top-full right-4"></div>
          </div>
        )}

        {/* Language Button Container - Fixed hover area */}
        <div 
          className="mb-3 relative cursor-pointer"
          onMouseEnter={handleLanguageAreaEnter}
          onMouseLeave={handleLanguageAreaLeave}
        >
          {/* Language Button Tooltip */}
          {isLanguageHovered && !showLanguageSelector && (
            <div className="absolute right-0 px-3 py-2 text-xs text-white transition-all duration-200 transform bg-gray-900 rounded-lg shadow-xl bottom-10 whitespace-nowrap animate-fade-in z-50 pointer-events-none cursor-default">
              <span>{t('common.language') || 'Language'}</span>
              <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 border-transparent top-full right-3 border-t-gray-900"></div>
            </div>
          )}

          <button
            className="relative flex items-center justify-center w-10 h-10 transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-xl hover:scale-110 z-20 p-3 cursor-pointer"
            onClick={handleLanguageClick}
            aria-label="Select Language"
          >
            <Globe className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bot Button Container - Fixed hover area */}
        <div 
          className="relative cursor-pointer"
          onMouseEnter={handleBotAreaEnter}
          onMouseLeave={handleBotAreaLeave}
        >
          {/* Bot Button Tooltip */}
          {isBotHovered && !showLanguageSelector && (
            <div className="absolute right-0 px-3 py-2 text-xs text-white transition-all duration-200 transform bg-gray-900 rounded-lg shadow-xl bottom-14 whitespace-nowrap animate-fade-in z-40 pointer-events-none cursor-default">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-pink-400" />
                <span>Need someone to talk to?</span>
              </div>
              <div className="text-[10px] text-gray-300 mt-1">Chat with MindFull Bot</div>
              <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 border-transparent top-full right-3 border-t-gray-900"></div>
            </div>
          )}

          <Link
            to="/Chatbot"
            className="relative block z-20"
            onClick={handleChatClick}
            aria-label="Open Chat"
          >
            <div className="relative">
              {/* Large animated ring for attention */}
              {isPulsing && (
                <div 
                  className="absolute rounded-full -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-ping opacity-30"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              
              {/* Medium animated ring */}
              <div 
                className="absolute rounded-full -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-pulse opacity-40"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Button - Reduced size */}
              <div 
                className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 transform rounded-full shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:shadow-purple-500/50 hover:scale-110 hover:rotate-12 p-3 cursor-pointer"
              >
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              
              {/* Notification dot - Smaller */}
              <div 
                className="absolute flex items-center justify-center w-4 h-4 rounded-full shadow-lg -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 animate-bounce"
                style={{ pointerEvents: 'none' }}
              >
                <Sparkles className="w-2 h-2 text-white" style={{ pointerEvents: 'none' }} />
              </div>
              
              {/* Heart particles for extra appeal */}
              <div className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <div className="absolute text-sm text-pink-400 -top-1 -left-1 opacity-60 animate-float">💙</div>
                <div className="absolute text-sm text-purple-400 -bottom-1 -right-1 opacity-60 animate-float-delayed">✨</div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Message indicator - Repositioned to not cover button */}
        {showMessage && (
          <div className="absolute px-2 py-1 transform -translate-x-1/2 bg-white border rounded-full shadow-lg -top-8 left-1/2 animate-fade-in">
            <div className="text-[10px] text-gray-600 font-medium whitespace-nowrap">I'm here to help! 💚</div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </>
  );
};

export default FloatingChatButton;