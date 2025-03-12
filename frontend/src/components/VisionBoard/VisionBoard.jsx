import React, { useState, useEffect } from "react";
import { getVisionBoards, updateVisionBoard, deleteVisionBoard } from "../../services/visionBoardAPI.js";
import VisionItem from "./VisionItem";
import AIRecommendation from "./AIRecommendation";
import FileUpload from "./FileUpload";
import "../../styles/VisionBoard.css";
import DrawingBoard from "./DrawingBoard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Info, Home, ChevronLeft, ChevronRight, X, Download, Maximize2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const VisionBoard = () => {
  const [visionBoards, setVisionBoards] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [fullScreenView, setFullScreenView] = useState(null);
  const userId = JSON.parse(sessionStorage.getItem("user"))?._id;
    
  if (!userId) {
    setError("User not logged in");
    setIsSaving(false);
    return;
  }
  
  useEffect(() => {
    fetchVisionBoards();
  }, []);

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
    // If no destination or dropped in the same position, do nothing
    if (!result.destination || 
        (result.destination.droppableId === result.source.droppableId && 
         result.destination.index === result.source.index)) {
      return;
    }
  
    // Create a copy of the visionBoards array
    const updatedBoards = Array.from(visionBoards);
    
    // Remove the dragged item from its source position
    const [movedBoard] = updatedBoards.splice(result.source.index, 1);
    
    // Insert the item at its destination position
    updatedBoards.splice(result.destination.index, 0, movedBoard);
    
    // Update the state with the new order
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
    
    // Optimize grid based on number of items
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
    
    // Add class to prevent body scrolling
    document.body.classList.add('overflow-hidden');
  };
  
  // Function to close fullscreen view
  const closeFullScreen = () => {
    setFullScreenView(null);
    
    // Remove class to enable body scrolling
    document.body.classList.remove('overflow-hidden');
  };
  
  // Full screen navigation - previous
  const navigatePrevious = () => {
    if (!fullScreenView) return;
    
    const currentIndex = visionBoards.findIndex(board => board._id === fullScreenView._id);
    if (currentIndex > 0) {
      setFullScreenView(visionBoards[currentIndex - 1]);
    } else {
      // Loop to last item if at beginning
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
      // Loop to first item if at end
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
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-5 flex flex-col items-center relative">
        {/* Brand name */}
        <div className="mb-2 text-4xl text-blue-600 font-medium">VisionFull</div>
        
        {/* Inspirational tagline */}
        <p className="text-gray-600 italic mb-6">Visualize • Believe • Achieve</p>
        
        {/* Decorative elements - positive words */}
        <div className="absolute top-5 left-10 rotate-[-15deg] text-purple-300 font-bold opacity-30 text-2xl">Success</div>
        <div className="absolute top-12 right-12 rotate-[10deg] text-blue-300 font-bold opacity-30 text-2xl">Growth</div>
        <div className="absolute top-28 left-16 rotate-[5deg] text-green-300 font-bold opacity-30 text-xl">Harmony</div>
        <div className="absolute top-20 right-24 rotate-[-5deg] text-pink-300 font-bold opacity-30 text-xl">Fulfillment</div>
        <div className="absolute top-32 left-40 rotate-[12deg] text-yellow-300 font-bold opacity-30 text-xl">Joy</div>
        
        {/* Decorative icons */}
        <div className="absolute top-10 left-32 text-blue-200 opacity-40 text-2xl">✨</div>
        <div className="absolute top-24 right-40 text-yellow-200 opacity-40 text-2xl">⭐</div>
        <div className="absolute top-16 left-72 text-purple-200 opacity-40 text-3xl">🌟</div>
        <div className="absolute top-5 right-72 text-green-200 opacity-40 text-2xl">💫</div>
        
        {/* Small wellness quote */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm mb-8 max-w-3xl">
          <p className="text-center text-gray-700">
            "Your vision board is a visual representation of your future self. What you focus on expands."
          </p>
        </div>
        <div className="flex items-center justify-center mb-5">
  <h1 className="text-2xl font-bold text-center">My Vision Boards</h1>
  <button 
    onClick={fetchVisionBoards}
    className="ml-3 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all flex items-center justify-center"
    aria-label="Refresh vision boards"
    title="Refresh vision boards"
  >
    <RefreshCw size={18} />
  </button>
</div>

        {/* Home button to navigate back to main page */}
        <Link to="/MainPage" className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center">
          <Home size={18} className="mr-1" />
          <span>Home</span>
        </Link>

        {/* Horizontal scrolling container with navigation buttons */}
        <div className="relative w-full max-w-4xl">
          {/* Left scroll button - only visible if there are more than 3 items */}
          {visionBoards?.length > 3 && (
            <button 
              onClick={scrollLeft} 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-gray-100 text-blue-600"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {/* Right scroll button - only visible if there are more than 3 items */}
          {visionBoards?.length > 3 && (
            <button 
              onClick={scrollRight} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-gray-100 text-blue-600"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          )}
          
          {/* Horizontal scrollable container */}
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
                            className="vision-board p-3 border rounded-lg shadow-sm bg-white flex-shrink-0 w-64 transition-all hover:shadow-md"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-xl font-semibold truncate">{board.title}</h3>
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
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
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm p-6 w-64">
                      <div className="text-gray-400 mb-4 text-6xl">✨</div>
                      <h3 className="text-xl font-medium text-gray-600 mb-2">
                        No vision boards yet
                      </h3>
                      <p className="text-gray-500 mb-4">
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

        {/* File Upload for Vision Board */}
        <FileUpload userId={userId} fetchVisionBoards={fetchVisionBoards} />
        
 {/* AI-based recommendations */}
 <div className="w-full">
  <AIRecommendation userId={userId} fetchVisionBoards={fetchVisionBoards} />
</div>
        {/* Add Drawing Feature */}
        <div className="text-center text-2xl font-bold mb-5 mt-8">
          <h2>Create your Vision Board using the canvas</h2>
          <DrawingBoard />
        </div>

        {/* Info Button */}
        <button
          className="fixed bottom-10 right-10 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
          onClick={() => setInfoOpen(!infoOpen)}
        >
          <Info size={24} />
        </button>

        {/* Side Panel for Info */}
        {infoOpen && (
          <div className="info-sidebar fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 overflow-y-auto z-50">
            {/* Top-right close button */}
            <button 
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setInfoOpen(false)}
            >
              ✕
            </button>
            
            <h1 className="text-xl font-bold mb-4">Vision Board</h1>
            
            <p className="mb-3">
              A vision board is a creative collage that visually represents your goals, dreams, and aspirations. It includes images, quotes, and other inspirational elements that help keep your focus and motivation high.
            </p>
            
            <div className="mb-3">🎨 Draw your vision using the canvas.</div>
            <div className="mb-3">📂 Upload an existing vision board file.</div>
            <div className="mb-3">💡 Get AI-generated quotes based on your goals.</div>
            
            <h2 className="text-lg font-bold mt-6 mb-2">How to Use the Canvas</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold">Adding Elements</h3>
                <ul className="list-disc pl-5 mt-1">
                  <li><strong>Add Text:</strong> Create editable text boxes</li>
                  <li><strong>Add Image:</strong> Upload images from your device</li>
                  <li><strong>Add Flow Line:</strong> Create connectors with adjustable endpoints</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Editing Elements</h3>
                <ul className="list-disc pl-5 mt-1">
                  <li>Select elements by clicking on them</li>
                  <li>Move elements by dragging them</li>
                  <li>Edit text by double-clicking or using Edit button</li>
                  <li>Resize images with corner handles</li>
                  <li>Style text with fonts, sizes, colors, formatting</li>
                  <li>Adjust lines by dragging endpoints or the line itself</li>
                  <li>Change line color and thickness</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Managing Your Board</h3>
                <ul className="list-disc pl-5 mt-1">
                  <li><strong>Undo:</strong> Remove the last added element</li>
                  <li><strong>Delete:</strong> Remove the selected element</li>
                  <li><strong>Save Board:</strong> Download as PNG image</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col space-y-2">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                onClick={() => setInfoOpen(false)}
              >
                Close
              </button>
              
              <Link 
                to="/MainPage"
                className="px-4 py-2 bg-gray-100 text-blue-600 rounded hover:bg-gray-200 text-center w-full"
              >
                Back to Main Page
              </Link>
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
      </div>
    </DragDropContext>
  );
};

export default VisionBoard;