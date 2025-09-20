import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Plus, RefreshCw, Lock, Unlock, Sparkles, Lightbulb, ArrowLeft, Calendar, Smile, Meh, Frown, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const JournalApp = () => {
  const [currentView, setCurrentView] = useState('view');
  const [entryText, setEntryText] = useState('');
  const [topic, setTopic] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [unlockedEntries, setUnlockedEntries] = useState(new Set());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [entryToUnlock, setEntryToUnlock] = useState(null);
  const [darkMode, setDarkMode] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(true);

  const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem("accessToken") : '';
  const storedPassword = typeof window !== 'undefined' ? sessionStorage.getItem("password") : '';

  useEffect(() => {
    if (currentView === 'view') {
      fetchJournalEntries();
    }
  }, [currentView]);

  const handleThemeChoice = (isDark) => {
    setDarkMode(isDark);
    setShowThemeModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('journalDarkMode', isDark.toString());
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('journalDarkMode', newMode.toString());
    }
  };

  const fetchJournalEntries = async () => {
    try {
      setLoadingEntries(true);
      const journalResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/journal-entries`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await journalResponse.json();
      
      if (!journalResponse.ok) throw new Error(data.message);
      
      setJournalEntries(data.journals || []);
    } catch (err) {
      alert(`Error fetching entries: ${err.message}`);
    } finally {
      setLoadingEntries(false);
    }
  };

  const createEntry = async () => {
    try {
      setLoadingSave(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/journals/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryText,
          topic,
          moodScore,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      // Success notification with gentle styling
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = '✨ Your thoughts have been safely saved';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      setEntryText('');
      setTopic('');
      setMoodScore(5);
      
      if (currentView === 'view') {
        fetchJournalEntries();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  const getAiAssistance = async () => {
    try {
      setLoadingAI(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/journals/assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, moodScore }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setAiSuggestions(data.suggestions);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const getSuggestedTopics = async () => {
    try {
      setLoadingTopics(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/journals/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodScore,
          count: 5,
        }),
      });

      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Failed to fetch topics");
  
      setSuggestedTopics(data.topics || []);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleUnlockEntry = (entryId) => {
    setEntryToUnlock(entryId);
    setShowPasswordModal(true);
    setPasswordInput('');
  };

  const verifyPassword = () => {
    if (passwordInput === storedPassword) {
      setUnlockedEntries(prev => new Set([...prev, entryToUnlock]));
      setShowPasswordModal(false);
      setPasswordInput('');
      setEntryToUnlock(null);
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
  };

  const getMoodColor = (mood) => {
    if (mood >= 8) return darkMode ? 'text-emerald-400' : 'text-emerald-600';
    if (mood >= 6) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    if (mood >= 4) return darkMode ? 'text-orange-400' : 'text-orange-600';
    if (mood >= 2) return darkMode ? 'text-rose-400' : 'text-rose-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getMoodBg = (mood) => {
    if (darkMode) {
      if (mood >= 8) return 'bg-emerald-900/20 border-emerald-700/30';
      if (mood >= 6) return 'bg-yellow-900/20 border-yellow-700/30';
      if (mood >= 4) return 'bg-orange-900/20 border-orange-700/30';
      if (mood >= 2) return 'bg-rose-900/20 border-rose-700/30';
      return 'bg-red-900/20 border-red-700/30';
    } else {
      if (mood >= 8) return 'bg-emerald-50 border-emerald-200';
      if (mood >= 6) return 'bg-yellow-50 border-yellow-200';
      if (mood >= 4) return 'bg-orange-50 border-orange-200';
      if (mood >= 2) return 'bg-rose-50 border-rose-200';
      return 'bg-red-50 border-red-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MoodSlider = ({ value, onChange }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className={`font-medium flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <Heart className="w-4 h-4 text-rose-500" />
          How are you feeling today?
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getMoodEmoji(value)}</span>
          <span className={`font-semibold ${getMoodColor(value)}`}>{value}/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min="1"
          max="10"
          step="1"
          className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-emerald-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className={`flex justify-between text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center gap-1"><Frown className="w-3 h-3" />Low</span>
          <span className="flex items-center gap-1"><Meh className="w-3 h-3" />Okay</span>
          <span className="flex items-center gap-1"><Smile className="w-3 h-3" />Great</span>
        </div>
      </div>
    </div>
  );

 if (showThemeModal) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        {/* Branding */}
        <div className="mb-8 animate-fade-in">
          <a className="flex title-font font-medium items-center text-gray-900 group transition-all duration-300 hover:scale-105 flex-shrink-0" href="/MainPage">
            <div className="relative">
              <img src="plant.png" alt="Logo" className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="ml-3 text-2xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent font-bold tracking-wide">
              Soulynk
            </span>
          </a>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">Welcome to Your Wellness Journal</h2>
            <p className="text-slate-400">Choose your preferred theme to get started</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleThemeChoice(false)}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-300 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Light Mode</h3>
                <p className="text-sm text-slate-600">Bright and clean interface</p>
              </div>
            </button>
            
            <button
              onClick={() => handleThemeChoice(true)}
              className="w-full p-4 bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 rounded-xl hover:border-slate-500 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-200">Dark Mode</h3>
                <p className="text-sm text-slate-400">Easy on the eyes, perfect for evening use</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}

      <header className={`backdrop-blur-sm border-b sticky top-0 z-40 transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900/80 border-slate-700' 
          : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Top row with back button, centered title, and theme toggle */}
          <div className="flex items-center justify-between mb-4">
            {/* Left: Back Button */}
            <Link 
              to="/MainPage"
              className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium sm:text-base">Back to Dashboard</span>
            </Link>

            {/* Center: Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className={`hidden md:block text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                My Wellness Journal
              </h1>
              <h1 className={`md:hidden text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                Journal
              </h1>
            </div>

            {/* Right: Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
              
          {/* Desktop/Laptop View - Your original buttons */}
          <div className="hidden md:flex items-center justify-center">
            <button
              onClick={() => setCurrentView('view')}
              className={`flex items-center gap-2 px-5 py-2 rounded-l-full transition-all duration-200 min-w-[140px] justify-center ${
                currentView === 'view' 
                  ? darkMode 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : darkMode 
                    ? 'text-slate-400 hover:bg-slate-800' 
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">View Entries</span>
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-r-full transition-all duration-200 min-w-[140px] justify-center overflow-visible ${
                darkMode 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-indigo-400 to-blue-400 text-white shadow-sm hover:from-indigo-500 hover:to-blue-500'
              }`}
            >
              {/* First radiating layer */}
              <div className={`absolute inset-0 rounded-r-full animate-ping ${
                darkMode 
                  ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 opacity-40' 
                  : 'bg-gradient-to-r from-red-400 to-rose-400 opacity-30'
              }`}></div>
              {/* Second radiating layer */}
              <div className={`absolute -inset-1 rounded-r-full animate-pulse ${
                darkMode 
                  ? 'bg-gradient-to-r from-teal-400/20 to-cyan-400/20 opacity-30' 
                  : 'bg-gradient-to-r from-red-300 to-rose-300 opacity-25'
              }`}></div>
              {/* Outer radiating layer */}
              <div 
                className={`absolute -inset-2 rounded-r-full animate-pulse ${
                  darkMode 
                    ? 'bg-gradient-to-r from-teal-300/10 to-cyan-300/10 opacity-20' 
                    : 'bg-gradient-to-r from-red-200 to-rose-200 opacity-20'
                }`}
                style={{
                  animationDelay: '0.5s',
                  animationDuration: darkMode ? '4s' : '3s'
                }}
              ></div>
              
              <Plus className="w-4 h-4 relative z-10 text-white" />
              <span className="font-medium relative z-10 text-white">New Entry</span>
            </button>
          </div>

          {/* Mobile/Tablet View - Tab switcher on next row, centered */}
          <div className="md:hidden flex justify-center">
            <div className={`flex rounded-lg p-1 max-w-sm w-full ${
              darkMode ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <button
                onClick={() => setCurrentView('view')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  currentView === 'view'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-indigo-600 shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium text-sm">View</span>
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  currentView === 'create'
                    ? darkMode
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white text-indigo-600 shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">Create</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'view' ? (
          // View Entries Section
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Your Journal Entries</h2>
                <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>A safe space for your thoughts and feelings</p>
              </div>
              <button
                onClick={fetchJournalEntries}
                disabled={loadingEntries}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border transition-all disabled:opacity-50 ${
                  darkMode 
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:shadow-md'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loadingEntries ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            
{loadingEntries ? (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      {/* Main spinner */}
      <div className={`w-6 h-6 border-2 rounded-full animate-spin ${
        darkMode 
          ? 'border-slate-600 border-t-indigo-400' 
          : 'border-slate-200 border-t-indigo-500'
      }`}></div>
      
      <div className={`absolute inset-0 w-6 h-6 border border-transparent rounded-full ${
        darkMode 
          ? 'border-t-slate-700' 
          : 'border-t-slate-100'
      } animate-spin`} style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
    </div>
    
    <p className={`text-sm mt-3 font-medium ${
      darkMode ? 'text-slate-400' : 'text-slate-500'
    }`}>
      Loading entries...
    </p>
  </div>
) : journalEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-700' 
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                }`}>
                  <BookOpen className={`w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Start Your Wellness Journey</h3>
                <p className={`mb-6 max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your journal is empty. Begin by creating your first entry to track your thoughts and emotions.
                </p>
               <button
  onClick={() => setCurrentView('create')}
  className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all overflow-hidden"
>
  {/* Inner radiating layer */}
  <div className="absolute inset-0 rounded-lg animate-ping bg-gradient-to-r from-emerald-400 to-teal-400 opacity-75"></div>
  
  {/* Middle radiating layer */}
  <div className="absolute -inset-1 rounded-lg animate-pulse bg-gradient-to-r from-emerald-300 to-teal-300 opacity-50"></div>
  
  {/* Outer radiating layer with delay */}
  <div 
    className="absolute -inset-2 rounded-lg animate-pulse bg-gradient-to-r from-emerald-200 to-teal-200 opacity-30" 
    style={{animationDelay: '0.5s'}}
  ></div>
  
  <Plus className="w-5 h-5 relative z-10" />
  <span className="relative z-10">Create Your First Entry</span>
</button>
              </div>
            ) : (
              <div className="grid gap-6">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className={`rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                    darkMode ? 'bg-slate-800' : 'bg-white'
                  } ${getMoodBg(entry.moodScore)}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          }`}>
                            <span className="text-2xl">{getMoodEmoji(entry.moodScore)}</span>
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{entry.topic}</h3>
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(entry.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          } ${getMoodColor(entry.moodScore)}`}>
                            <Heart className="w-3 h-3" />
                            {entry.moodScore}/10
                          </span>
                        </div>
                      </div>

                      {entry.moodScore < 5 && !unlockedEntries.has(entry.id) ? (
                        <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                          darkMode 
                            ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/50' 
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                        }`}>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                          }`}>
                            <Lock className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          </div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Protected Entry</h4>
                          <p className={`mb-4 max-w-sm mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            This entry contains sensitive content and is securely locked for your privacy and wellbeing.
                          </p>
                          <button
                            onClick={() => handleUnlockEntry(entry.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                            }`}
                          >
                            <Unlock className="w-4 h-4" />
                            Unlock Entry
                          </button>
                        </div>
                      ) : (
                        <div className="prose prose-slate max-w-none">
                          <p className={`whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{entry.entryText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Create Entry Section
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Create New Entry</h2>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Take a moment to reflect on your thoughts and feelings</p>
            </div>

            <div className={`rounded-2xl shadow-sm border p-8 space-y-8 ${
              darkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`}>
              {/* Topic Input */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  What's on your mind today?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Work stress, Family time, Personal growth..."
                  className={`w-full p-4 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Mood Score */}
              <MoodSlider value={moodScore} onChange={setMoodScore} />

              {/* Journal Entry */}
              <div className="space-y-3">
                <label className={`font-medium flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Share your thoughts
                </label>
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="This is your safe space. Write freely about your experiences, feelings, challenges, or victories. There's no right or wrong way to express yourself here..."
                  className={`w-full p-4 border rounded-lg resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                  rows="10"
                />
                <div className={`text-right text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {entryText.length} characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={createEntry}
                  disabled={loadingSave || !entryText.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loadingSave ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Save Entry
                    </>
                  )}
                </button>

                <button
                  onClick={getAiAssistance}
                  disabled={loadingAI || !topic.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loadingAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Getting Help...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Support
                    </>
                  )}
                </button>

                <button
                  onClick={getSuggestedTopics}
                  disabled={loadingTopics}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loadingTopics ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" />
                      Topic Ideas
                    </>
                  )}
                </button>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions && (
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Writing Support
                  </h4>
                  <div className="text-slate-700 leading-relaxed">
                    {typeof aiSuggestions === "string" ? (
                      aiSuggestions.split("##").map((section, index) => {
                        const [title, ...content] = section.trim().split("\n").filter(Boolean);
                        const cleanTitle = title.replace(/\*\*/g, '').trim();
                        const isContentSuggestions = cleanTitle.toLowerCase().includes('content suggestions');

                        return (
                          <div key={index} className="mb-6 last:mb-0">
                            <h5 className="text-lg font-semibold text-purple-800 mb-3">
                              {cleanTitle}
                            </h5>
                            <div className="space-y-2">
                              {content.map((line, lineIndex) => {
                                const cleanLine = line.replace(/\*\*/g, '');
                                
                                if (isContentSuggestions && line.trim().startsWith('•')) {
                                  return (
                                    <div key={lineIndex} className="flex items-start gap-2">
                                      <span className="text-purple-500 mt-1">•</span>
                                      <span className="text-slate-700">{cleanLine.replace('•', '').trim()}</span>
                                    </div>
                                  );
                                } 
                                else if (!isContentSuggestions && /^\d+\./.test(line.trim())) {
                                  return (
                                    <div key={lineIndex} className="flex items-start gap-2">
                                      <span className="text-purple-500 font-medium">{line.match(/^\d+\./)[0]}</span>
                                      <span className="text-slate-700">{cleanLine.replace(/^\d+\./, '').trim()}</span>
                                    </div>
                                  );
                                }
                                else {
                                  return <p key={lineIndex} className="text-slate-700">{cleanLine}</p>;
                                }
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-600">AI support is currently unavailable. Please try again later.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Suggested Topics */}
              {suggestedTopics.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Writing Prompts for You
                  </h4>
                  <div className="grid gap-3">
                    {suggestedTopics.map((topic, index) => {
                      const cleanTopic = topic.replace(/\*\*/g, '');
                      const splitTopic = cleanTopic.split(':');
                      const title = splitTopic[0]?.trim();
                      const description = splitTopic[1]?.trim();

                      return (
                        <div 
                          key={index} 
                          className="p-4 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-all"
                          onClick={() => setTopic(title)}
                        >
                          <h5 className="font-medium text-amber-800 mb-1">{title}</h5>
                          {description && <p className="text-sm text-slate-600">{description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Enter Your Password</h3>
              <p className="text-slate-600">
                This entry is protected for your privacy and mental wellbeing.
              </p>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={verifyPassword}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  Unlock Entry
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setEntryToUnlock(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          border: 2px solid white;
        }
      `}</style>
      <style jsx>{`
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes ping {
    75%, 100% {
      transform: scale(1.1);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: linear-gradient(45deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    border: 2px solid white;
  }
  
  .slider::-moz-range-thumb {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: linear-gradient(45deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    border: 2px solid white;
  }
`}</style>
    </div>
  );
};

export default JournalApp;
