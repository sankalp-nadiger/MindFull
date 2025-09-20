import React, { useState, useEffect } from "react";
import { getVisionBoards, updateVisionBoard, deleteVisionBoard } from "../../services/visionBoardAPI.js";
import VisionItem from "./VisionItem";
import AIRecommendation from "./AIRecommendation";
import FileUpload from "./FileUpload";
import "../../styles/VisionBoard.css";
// import DrawingBoard from "./DrawingBoard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Info, Home, ChevronLeft, ChevronRight, X, Download, Maximize2, RefreshCw,
  MousePointer, Move, ZoomIn, PenLine, Save, Check, ArrowLeft, Heart, Sun, Moon,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const VisionBoard = () => {
  const { t } = useTranslation();
  const [isDrawingBoardVisible, setIsDrawingBoardVisible] = useState(false);
  const [visionBoards, setVisionBoards] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullScreenView, setFullScreenView] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [isMobile, setIsMobile] = useState(false);
  
  const userId = JSON.parse(sessionStorage.getItem("user"))?._id;
  // Add this inside your VisionBoard component
useEffect(() => {
  // Check if device is mobile
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth <= 768); // Consider devices <= 768px as mobile
  };

  // Initial check
  checkIfMobile();

  // Add event listener for window resize
  window.addEventListener('resize', checkIfMobile);

  // Set up drawing board observer only if not mobile
  if (!isMobile) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDrawingBoardVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const drawingBoard = document.getElementById('drawing-board-section');
    if (drawingBoard) observer.observe(drawingBoard);

    return () => {
      if (drawingBoard) observer.unobserve(drawingBoard);
      window.removeEventListener('resize', checkIfMobile);
    };
  }

  // Cleanup
  return () => {
    window.removeEventListener('resize', checkIfMobile);
  };
}, [isMobile]);
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('visionBoardDarkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    } else {
      // Show theme modal on first visit
      setShowThemeModal(true);
    }
    
    if (!userId) {
      setError("User not logged in");
      setIsSaving(false);
      return;
    }
    fetchVisionBoards();
  }, [userId]);

  const handleThemeChoice = (isDark) => {
    setDarkMode(isDark);
    setShowThemeModal(false);
    localStorage.setItem('visionBoardDarkMode', isDark.toString());
  };

  const fetchVisionBoards = async () => {
    const response = await getVisionBoards(userId);
    setVisionBoards(response.data);
  };

  const handleDelete = async (boardId) => {
    await deleteVisionBoard(boardId);
    fetchVisionBoards();
  };
  
  // Handle horizontal drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination || 
        (result.destination.droppableId === result.source.droppableId && 
         result.destination.index === result.source.index)) {
      return;
    }
  
    const updatedBoards = Array.from(visionBoards);
    const [movedBoard] = updatedBoards.splice(result.source.index, 1);
    updatedBoards.splice(result.destination.index, 0, movedBoard);
    setVisionBoards(updatedBoards);
  };

  // Scroll controls for horizontal scrolling
  const scrollLeft = () => {
    const container = document.getElementById('vision-boards-container');
    container.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = document.getElementById('vision-boards-container');
    container.scrollBy({ left: 300, behavior: 'smooth' });
  };
  
  // Calculate optimal grid layout
  const getGridClasses = () => {
    const count = visionBoards?.length || 0;
    
    if (count === 0) return "flex items-start gap-4 min-w-max p-4";
    
    if (count <= 3) {
      return "flex items-start justify-center gap-6 p-4";
    } else if (count <= 6) {
      return "flex items-start justify-start gap-6 min-w-max p-4";
    } else {
      return "flex items-start gap-4 min-w-max p-4";
    }
  };
  
  // Function to open fullscreen view
  const openFullScreen = (board) => {
    setFullScreenView(board);
    document.body.classList.add('overflow-hidden');
  };
  
  // Function to close fullscreen view
  const closeFullScreen = () => {
    setFullScreenView(null);
    document.body.classList.remove('overflow-hidden');
  };
  
  // Full screen navigation - previous
  const navigatePrevious = () => {
    if (!fullScreenView) return;
    
    const currentIndex = visionBoards.findIndex(board => board._id === fullScreenView._id);
    if (currentIndex > 0) {
      setFullScreenView(visionBoards[currentIndex - 1]);
    } else {
      setFullScreenView(visionBoards[visionBoards.length - 1]);
    }
  };
  
  // Full screen navigation - next
  const navigateNext = () => {
    if (!fullScreenView) return;
    
    const currentIndex = visionBoards.findIndex(board => board._id === fullScreenView._id);
    if (currentIndex < visionBoards.length - 1) {
      setFullScreenView(visionBoards[currentIndex + 1]);
    } else {
      setFullScreenView(visionBoards[0]);
    }
  };
  
  // Handle keyboard navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fullScreenView) return;
      
      if (e.key === 'Escape') {
        closeFullScreen();
      } else if (e.key === 'ArrowLeft') {
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullScreenView, visionBoards]);
  // Add this useEffect to ensure page starts at top
useEffect(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0);
}, []);

  // Theme modal component
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
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-pulse">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">Welcome to Your Vision Space</h2>
            <p className="text-slate-400">Choose your preferred theme for a personalized wellness experience</p>
          </div>
         

          <div className="space-y-4">
            <button
              onClick={() => handleThemeChoice(false)}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-300 transition-all flex items-center gap-4 hover:scale-105"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Light Mode</h3>
                <p className="text-sm text-slate-600">Bright and uplifting interface</p>
              </div>
            </button>
            
            <button
              onClick={() => handleThemeChoice(true)}
              className="w-full p-4 bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 rounded-xl hover:border-slate-500 transition-all flex items-center gap-4 hover:scale-105"
            >
              <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-200">Dark Mode</h3>
                <p className="text-sm text-slate-400">Calming and gentle on the eyes</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const themeClasses = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    text: darkMode ? 'text-slate-200' : 'text-gray-800',
    textSecondary: darkMode ? 'text-slate-400' : 'text-gray-600',
    brandText: darkMode ? 'text-indigo-400' : 'text-blue-600',
    card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    cardHover: darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50',
    button: darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200',
    decorativeText: darkMode ? 'text-indigo-300/20' : 'text-purple-300/30',
    quote: darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50',
    scrollButton: darkMode ? 'bg-slate-700/80 hover:bg-slate-600 text-indigo-400' : 'bg-white/80 hover:bg-gray-100 text-blue-600'
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-300`}>
      <div className="p-5 flex flex-col items-center relative pb-20">
        
        {/* Header row with Back button, Brand name, and Theme toggle */}
        <div className="w-full flex items-center mb-6 relative">
          {/* Back button - Left */}
          <Link 
            to="/MainPage"
            className={`flex items-center justify-center gap-1 sm:gap-2 ${themeClasses.text} hover:${themeClasses.textSecondary} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:block text-sm font-medium sm:text-base">Back to Dashboard</span>
          </Link>
          
          {/* Brand name - Absolute Center */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 text-4xl ${themeClasses.brandText} font-medium`}>
            VisionFull
          </div>
          
          {/* Theme toggle button - Right */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`ml-auto ${themeClasses.buttonSecondary} ${darkMode ? 'text-slate-300' : 'text-gray-700'} p-2 rounded-lg shadow-md transition-all flex items-center gap-2`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Inspirational tagline */}
        <p className={`${themeClasses.textSecondary} italic mb-6`}>Visualize • Believe • Achieve</p>
              
        {/* Decorative elements - positive words */}
        <div className="absolute top-32 left-16 rotate-[-15deg] text-purple-300 font-bold opacity-30 text-2xl">Success</div>
        <div className="absolute top-28 right-24 rotate-[10deg] text-blue-300 font-bold opacity-30 text-2xl">Growth</div>
        <div className="absolute top-64 left-8 rotate-[5deg] text-green-300 font-bold opacity-30 text-xl">Harmony</div>
        <div className="absolute top-72 right-12 rotate-[-5deg] text-pink-300 font-bold opacity-30 text-xl">Fulfillment</div>
        <div className="absolute top-96 left-32 rotate-[12deg] text-yellow-300 font-bold opacity-30 text-xl">Joy</div>
        <div className="absolute top-80 right-40 rotate-[-8deg] text-indigo-300 font-bold opacity-30 text-xl">Dreams</div>
        <div className="absolute top-48 left-64 rotate-[15deg] text-emerald-300 font-bold opacity-30 text-xl">Peace</div>
        <div className="absolute top-56 right-64 rotate-[-10deg] text-orange-300 font-bold opacity-30 text-xl">Hope</div>

        {/* Decorative icons */}
        <div className="absolute top-40 left-48 text-blue-200 opacity-40 text-2xl">✨</div>
        <div className="absolute top-88 right-28 text-yellow-200 opacity-40 text-2xl">⭐</div>
        <div className="absolute top-52 left-80 text-purple-200 opacity-40 text-3xl">🌟</div>
        <div className="absolute top-36 right-80 text-green-200 opacity-40 text-2xl">💫</div>
        <div className="absolute top-68 right-56 text-cyan-200 opacity-40 text-2xl">🦋</div>
        <div className="absolute top-92 left-56 text-violet-200 opacity-40 text-2xl">🌺</div>
        <div className="absolute top-84 right-72 text-rose-200 opacity-40 text-2xl">🌈</div>
              
        {/* Small wellness quote */}
        <div className={`${themeClasses.quote} p-4 rounded-lg shadow-sm mb-8 max-w-3xl relative z-10`}>
          <p className={`text-center ${themeClasses.text}`}>
            {t('visionBoard.welcomeQuote')}
          </p>
        </div>

        <div className="flex items-center justify-center mb-5 relative">
          <h1 className={`text-2xl font-bold text-center ${themeClasses.text}`}>{t('visionBoard.myBoards')}</h1>
          <button 
            onClick={fetchVisionBoards}
            className={`ml-3 p-2 ${darkMode ? 'bg-indigo-100/10 text-indigo-400 hover:bg-indigo-100/20' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} rounded-full transition-all flex items-center justify-center`}
            aria-label="Refresh vision boards"
            title="Refresh vision boards"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Horizontal scrolling container */}
        <div className="relative w-full max-w-4xl">
          {visionBoards?.length > 3 && (
            <>
              <button 
                onClick={scrollLeft} 
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 ${themeClasses.scrollButton} p-2 rounded-full shadow-md transition-all`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={scrollRight} 
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 ${themeClasses.scrollButton} p-2 rounded-full shadow-md transition-all`}
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          <div 
            id="vision-boards-container" 
            className="overflow-x-auto pb-4 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
            style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}
          >
            <Droppable droppableId="vision-boards-list" type="BOARD" direction="horizontal">
              {(provided) => (
                <div 
                  className={getGridClasses()}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visionBoards?.length > 0 ? (
                    visionBoards.map((board, index) => (
                      <Draggable key={board._id} draggableId={board._id} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`vision-board p-3 border rounded shadow-sm flex-shrink-0 w-64 transition-all hover:shadow-md ${darkMode ? 'bg-indigo-400/50' : 'bg-white'}  `}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className={`text-xl font-semibold truncate ${themeClasses.text}`}>{board.title}</h3>
                              <span className={`${darkMode ? 'bg-indigo-100/10 text-indigo-300' : 'bg-blue-100 text-blue-800'} text-xs font-medium px-2.5 py-0.5 rounded`}>
                                {board.category}
                              </span>
                            </div>
                            
                            <div 
                              className="vision-items p-3 relative group cursor-pointer"
                              onClick={() => openFullScreen(board)}
                            >
                              <img 
                                src={board.content} 
                                alt="Vision" 
                                className="w-full h-40 object-cover rounded transition-all" 
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 size={28} className="text-white" />
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDelete(board._id)}
                              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-all w-full"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className={`text-center py-10 ${themeClasses.card} rounded-lg shadow-sm p-6 w-64`}>
                      <div className={`${darkMode ? 'text-indigo-400/50' : 'text-gray-400'} mb-4 text-6xl`}>✨</div>
                      <h3 className={`text-xl font-medium ${themeClasses.text} mb-2`}>
                        No vision boards yet
                      </h3>
                      <p className={`${themeClasses.textSecondary} mb-4`}>
                        Create your first vision board to visualize your goals and dreams
                      </p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* Button to scroll to drawing board - Only show on desktop */}
        {!isMobile && (
          <div className="w-full flex justify-center my-8">
            <button
              onClick={() => {
                document.getElementById('drawing-board-section')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              className={`
                relative overflow-hidden
                ${darkMode ? 
                  'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' : 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                }
                text-white px-8 py-4 rounded-full 
                flex items-center gap-3
                shadow-lg hover:shadow-xl
                transition-all duration-300
                transform hover:scale-105
                animate-[pulse_2.5s_ease-in-out_infinite]
              `}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-white/10 rounded-full filter blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              
              <ChevronDown size={20} className="relative z-10" />
              <span className="relative z-10 font-medium text-lg">Draw a Vision Board</span>
              <ChevronDown size={20} className="relative z-10" />
              
              {/* Animated ring */}
              <div className={`
                absolute -inset-2 border-2 rounded-full
                ${darkMode ? 'border-indigo-400/30' : 'border-blue-400/30'}
                animate-[ping_3s_ease-out_infinite]
                pointer-events-none
              `}></div>
            </button>
          </div>
        )}

        {/* FileUpload and AIRecommendation components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
          <FileUpload 
            userId={userId} 
            fetchVisionBoards={fetchVisionBoards} 
            darkMode={darkMode}
          />
          <AIRecommendation 
            userId={userId} 
            fetchVisionBoards={fetchVisionBoards}
            darkMode={darkMode}
          />
        </div>

        {/* Drawing Board Section - Mobile Check Only Here */}
        <div id="drawing-board-section" className="relative py-12">
          <div className="relative z-10 text-center">
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
              Create your Vision Board
            </h2>
            
            {isMobile ? (
              // Mobile message only for drawing board
              <div className={`${themeClasses.card} rounded-xl p-8 shadow-lg max-w-md mx-auto text-center space-y-4`}>
                <div className={`w-20 h-20 mx-auto ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'} rounded-full flex items-center justify-center`}>
                  <Maximize2 className={`w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`text-xl font-semibold ${themeClasses.text}`}>Drawing Feature Unavailable on Mobile</h3>
                <p className={themeClasses.textSecondary}>
                  The Vision Board drawing feature requires a larger screen for the best experience. 
                  Please access this feature on a tablet or desktop device.
                </p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  You can still view your existing boards and use the upload/AI features above!
                </p>
              </div>
            ) : (
              // Full drawing board for desktop/tablet
              <div className="max-w-6xl mx-auto">
                <div className={`
                  rounded-xl 
                  overflow-hidden
                  transition-all duration-500
                  ${darkMode 
                    ? 'shadow-[0_0_40px_rgba(99,102,241,0.3),0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4),0_0_25px_rgba(99,102,241,0.25)]' 
                    : 'shadow-[0_0_40px_rgba(59,130,246,0.25),0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_rgba(59,130,246,0.35),0_0_25px_rgba(59,130,246,0.2)]'
                  }
                `}>
                  {/* <DrawingBoard /> */}
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Info Button */}
          <button
            className={`fixed bottom-10 right-10 ${themeClasses.button} text-white p-4 rounded-full shadow-lg transition-all`}
            onClick={() => setInfoOpen(!infoOpen)}
          >
            <Info size={24} />
          </button>

          {/* Side Panel for Info */}
          {infoOpen && (
            <div className={`info-sidebar fixed right-0 top-0 h-full w-80 ${themeClasses.card} shadow-lg p-6 overflow-y-auto z-50`}>
              <button 
                className={`absolute top-4 right-4 ${themeClasses.textSecondary} hover:${themeClasses.text}`}
                onClick={() => setInfoOpen(false)}
              >
                ✕
              </button>
              
              <h1 className={`text-xl font-bold mb-4 ${themeClasses.text}`}>Vision Board Creator</h1>
              
              <p className={`mb-3 ${themeClasses.textSecondary}`}>
                Create beautiful vision boards to visualize your goals, dreams, and wellness journey. 
                This tool helps you craft digital collages with images, text, and meaningful connections.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`${darkMode ? 'bg-indigo-900/30' : 'bg-blue-50'} p-3 rounded-lg`}>
                  <div className={`${darkMode ? 'text-indigo-400' : 'text-blue-600'} mb-1`}>🎨</div>
                  <div className={`font-medium ${themeClasses.text}`}>Draw & Sketch</div>
                </div>
                <div className={`${darkMode ? 'bg-emerald-900/30' : 'bg-green-50'} p-3 rounded-lg`}>
                  <div className={`${darkMode ? 'text-emerald-400' : 'text-green-600'} mb-1`}>📂</div>
                  <div className={`font-medium ${themeClasses.text}`}>Upload Images</div>
                </div>
                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} p-3 rounded-lg`}>
                  <div className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>💡</div>
                  <div className={`font-medium ${themeClasses.text}`}>AI Suggestions</div>
                </div>
                <div className={`${darkMode ? 'bg-amber-900/30' : 'bg-yellow-50'} p-3 rounded-lg`}>
                  <div className={`${darkMode ? 'text-amber-400' : 'text-yellow-600'} mb-1`}>✨</div>
                  <div className={`font-medium ${themeClasses.text}`}>Customize</div>
                </div>
              </div>
              
              <h2 className={`text-lg font-bold mt-6 mb-2 ${themeClasses.text}`}>How to use the Canvas</h2>
              
              <div className="space-y-4 text-sm">
                <div className={`p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text}`}>
                    <MousePointer className="w-4 h-4" />
                    Element Editing
                  </h3>
                  <ul className={`list-disc pl-5 mt-2 space-y-1 ${themeClasses.textSecondary}`}>
                    <li><strong>Right-click</strong> any element for quick actions</li>
                    <li><strong>Change colors</strong> of text, lines, and shapes</li>
                    <li><strong>Adjust sizes</strong> using the context menu</li>
                    <li><strong>Drag elements</strong> to reposition them</li>
                    <li><strong>Delete elements</strong> with right-click menu</li>
                  </ul>
                </div>
                
                <div className={`p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text}`}>
                    <Move className="w-4 h-4" />
                    Flexible Toolbar
                  </h3>
                  <ul className={`list-disc pl-5 mt-2 space-y-1 ${themeClasses.textSecondary}`}>
                    <li><strong>Drag toolbar</strong> anywhere on the screen</li>
                    <li><strong>Minimize/maximize</strong> with the arrow button</li>
                    <li><strong>Toolbar stays draggable</strong> even when minimized</li>
                    <li><strong>Drag from any empty space</strong> in the toolbar</li>
                  </ul>
                </div>
                
                <div className={`p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text}`}>
                    <ZoomIn className="w-4 h-4" />
                    Canvas Controls
                  </h3>
                  <ul className={`list-disc pl-5 mt-2 space-y-1 ${themeClasses.textSecondary}`}>
                    <li><strong>Zoom in/out</strong> with dedicated buttons</li>
                    <li><strong>Change background color</strong> using palette</li>
                    <li><strong>Clear entire board</strong> with one click</li>
                    <li><strong>Undo/redo actions</strong> with buttons or keyboard shortcuts</li>
                  </ul>
                </div>
                
                <div className={`p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text}`}>
                    <PenLine className="w-4 h-4" />
                    Drawing Tools
                  </h3>
                  <ul className={`list-disc pl-5 mt-2 space-y-1 ${themeClasses.textSecondary}`}>
                    <li><strong>Pen tool</strong> for freehand drawing</li>
                    <li><strong>Eraser tool</strong> with adjustable size</li>
                    <li><strong>Flow lines</strong> with straight or curved styles</li>
                    <li><strong>Adjust line thickness</strong> for all drawing tools</li>
                    <li><strong>Customize colors</strong> for all elements</li>
                  </ul>
                </div>
                
                <div className={`p-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text}`}>
                    <Save className="w-4 h-4" />
                    Save & Export
                  </h3>
                  <ul className={`list-disc pl-5 mt-2 space-y-1 ${themeClasses.textSecondary}`}>
                    <li><strong>Save board</strong> to your account</li>
                    <li><strong>Export as PNG</strong> for sharing</li>
                    <li><strong>Download high-resolution</strong> images</li>
                    <li><strong>Return to work</strong> anytime</li>
                  </ul>
                </div>
              </div>
              
              <h2 className={`text-lg font-bold mt-6 mb-2 ${themeClasses.text}`}>Keyboard Shortcuts</h2>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Undo</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Ctrl+Z</span>
                </div>
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Redo</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Ctrl+Y</span>
                </div>
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Delete</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Del</span>
                </div>
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Save</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Ctrl+S</span>
                </div>
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Clear All</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Ctrl+A</span>
                </div>
                <div className={`flex justify-between p-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'} rounded`}>
                  <span className={themeClasses.text}>Zoom In</span>
                  <span className={`font-mono ${darkMode ? 'bg-slate-500 text-slate-200' : 'bg-gray-200 text-gray-700'} px-2 rounded`}>Ctrl++</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col space-y-2">
                <button 
                  className={`px-4 py-2 ${themeClasses.button} text-white rounded-lg transition-all w-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
                  onClick={() => setInfoOpen(false)}
                >
                  <Check className="w-4 h-4" />
                  Start Creating
                </button>
                
                <Link 
                  to="/MainPage"
                  className={`px-4 py-2 ${themeClasses.buttonSecondary} ${darkMode ? 'text-slate-300' : 'text-gray-700'} rounded-lg transition-all text-center w-full flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Main Page
                </Link>
              </div>
              
              {/* Wellness Tips Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
                <h2 className={`text-lg font-bold mb-3 ${themeClasses.text}`}>✨ Wellness Tips</h2>
                <div className="space-y-3 text-sm">
                  <div className={`p-3 ${darkMode ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-emerald-50 border border-emerald-200'} rounded-lg`}>
                    <div className={`font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-1`}>🌱 Mindful Creation</div>
                    <p className={themeClasses.textSecondary}>Take deep breaths while creating. Let your intuition guide your vision board design.</p>
                  </div>
                  
                  <div className={`p-3 ${darkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'} rounded-lg`}>
                    <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>🎯 Intentional Goals</div>
                    <p className={themeClasses.textSecondary}>Focus on goals that align with your values and bring you genuine joy.</p>
                  </div>
                  
                  <div className={`p-3 ${darkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'} rounded-lg`}>
                    <div className={`font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-1`}>💫 Daily Reflection</div>
                    <p className={themeClasses.textSecondary}>Spend a few minutes daily looking at your vision board with gratitude.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Image Modal */}
          {fullScreenView && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Close button */}
                <button 
                  onClick={closeFullScreen}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all"
                  aria-label="Close fullscreen view"
                >
                  <X size={24} />
                </button>
                
                {/* Board title */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full">
                  <h2 className="text-white font-medium">{fullScreenView.title}</h2>
                </div>
                
                {/* Main image */}
                <div className="max-w-4xl max-h-screen p-8">
                  <img 
                    src={fullScreenView.content} 
                    alt={fullScreenView.title}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                  />
                </div>
                
                {/* Navigation arrows */}
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                  <button 
                    onClick={navigatePrevious}
                    className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all pointer-events-auto"
                    aria-label="Previous board"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  
                  <button 
                    onClick={navigateNext}
                    className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all pointer-events-auto"
                    aria-label="Next board"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>
                
                {/* Download button */}
                <a 
                  href={fullScreenView.content}
                  download={`${fullScreenView.title || 'vision-board'}.png`}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all"
                >
                  <Download size={18} />
                  <span>Download</span>
                </a>
                
                {/* Navigation instructions */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/50 text-sm">
                  Use arrow keys or click arrows to navigate • ESC to close
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${darkMode ? 'bg-red-900/90 border border-red-700' : 'bg-red-100 border border-red-400'} text-red-700 px-4 py-3 rounded-lg shadow-lg z-40`}>
              <div className="flex items-center gap-2">
                <X size={18} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isSaving && (
            <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
              <div className={`${themeClasses.card} p-6 rounded-lg shadow-xl flex items-center gap-3`}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className={themeClasses.text}>Saving your vision board...</span>
              </div>
            </div>
          )}
        </div>
      
    </div>
    </DragDropContext>
  );
};

export default VisionBoard;
