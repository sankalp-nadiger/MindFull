import React, { useState } from "react";
import { getAIImage, getAIQuote, updateVisionBoard } from "../../services/visionBoardAPI";
import { Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

const AIRecommendation = ({ userId, fetchVisionBoards, darkMode }) => {
  const { t } = useTranslation();
  // Define theme classes locally based on darkMode
  const themeClasses = {
    card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    text: darkMode ? 'text-slate-200' : 'text-gray-800',
    textSecondary: darkMode ? 'text-slate-400' : 'text-gray-600',
    brandText: darkMode ? 'text-indigo-400' : 'text-blue-600',
    button: darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
  };

  const [category, setCategory] = useState("");
  const [suggestedImage, setSuggestedImage] = useState("");
  const [suggestedQuote, setSuggestedQuote] = useState("");
  const [includeImage, setIncludeImage] = useState(false);
  const [includeQuote, setIncludeQuote] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAIContent = async () => {
    if (!category.trim()) {
      alert(t('visionBoard.aiRecommendation.enterCategory'));
      return;
    }

    setLoading(true);
    try {
      if (includeImage) {
        const image = await getAIImage(category);
        setSuggestedImage(image);
      }
      if (includeQuote) {
        const quote = await getAIQuote(category);
        setSuggestedQuote(quote);
      }
    } catch (error) {
      console.error("Error fetching AI content:", error);
      alert(t('visionBoard.aiRecommendation.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const addToVisionBoard = async () => {
    const items = [];
    if (suggestedImage) items.push({ type: "image", content: suggestedImage });
    if (suggestedQuote) items.push({ type: "quote", content: suggestedQuote });

    if (items.length > 0) {
      try {
        await updateVisionBoard(userId, { items });
        fetchVisionBoards();
        // Clear suggestions after adding
        setSuggestedImage("");
        setSuggestedQuote("");
        setCategory("");
        setIncludeImage(false);
        setIncludeQuote(false);
      } catch (error) {
        console.error("Error adding to vision board:", error);
        alert(t('visionBoard.aiRecommendation.addError'));
      }
    }
  };

  return (
     <div className={`ai-recommendation ${darkMode ? 'bg-indigo-400/50' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto border ${themeClasses.card}`}>
      <h3 className={`text-xl font-semibold mb-5 ${themeClasses.text} flex items-center ${darkMode ? 'text-white' : 'text-black'}`}>
        <Sparkles className={`mr-2 w-5 h-5 ${themeClasses.brandText}`} />
        {t('visionBoard.aiRecommendation.title')}
      </h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder={t('visionBoard.aiRecommendation.categoryPlaceholder')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`p-3 border rounded-lg w-full focus:outline-none focus:ring-2 transition-colors text-sm ${
            darkMode 
              ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />

        <div className="flex flex-col space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeImage}
              onChange={() => setIncludeImage(!includeImage)}
              className={`w-4 h-4 rounded focus:ring-2 transition-colors accent-current ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800'
                  : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-white'
              }`}
            />
            <span className={`${themeClasses.text} select-none`}>{t('visionBoard.aiRecommendation.includeImage')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeQuote}
              onChange={() => setIncludeQuote(!includeQuote)}
              className={`w-4 h-4 rounded focus:ring-2 transition-colors accent-current ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800'
                  : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-white'
              }`}
            />
            <span className={`${themeClasses.text} select-none`}>{t('visionBoard.aiRecommendation.includeQuote')}</span>
          </label>
        </div>

        <button
          onClick={fetchAIContent}
          disabled={loading || (!includeImage && !includeQuote)}
          className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 text-white disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            darkMode
              ? 'bg-indigo-600  hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:text-slate-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white disabled:bg-gray-400 disabled:text-gray-200'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('visionBoard.aiRecommendation.generating')}
            </span>
          ) : (
            t('visionBoard.aiRecommendation.generateSuggestions')
          )}
        </button>

        {/* AI Generated Content Display */}
        {(suggestedImage || suggestedQuote) && (
          <div className={`rounded-lg p-4 space-y-4 border ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-medium ${themeClasses.text}`}>{t('visionBoard.aiRecommendation.aiSuggestions')}</h4>
            
            {suggestedImage && (
  <div className="space-y-2">
    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>{t('visionBoard.aiRecommendation.generatedImage')}</p>
    <div className={`rounded-md overflow-hidden border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
      <img
        src={suggestedImage}
        alt="AI Generated Suggestion"
        className={`w-full max-w-md mx-auto shadow-sm ${darkMode ? 'bg-slate-700' : 'bg-white'}`}
        loading="lazy"
        onError={(e) => (e.currentTarget.style.display = "none")} // hide broken images
      />
    </div>
  </div>
)}

            
            {suggestedQuote && (
              <div className="space-y-2">
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>{t('visionBoard.aiRecommendation.generatedQuote')}</p>
                <blockquote className={`text-lg font-medium italic ${themeClasses.text} border-l-4 pl-4 ${
                  darkMode ? 'border-indigo-400' : 'border-blue-500'
                }`}>
                  "{suggestedQuote}"
                </blockquote>
              </div>
            )}
          </div>
        )}

        {(suggestedImage || suggestedQuote) && (
          <button
            onClick={addToVisionBoard}
            className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-slate-800'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white'
            }`}
          >
            {t('visionBoard.aiRecommendation.addToBoard')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIRecommendation;