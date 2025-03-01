import React, { useState, useEffect } from "react";
import { getVisionBoards, updateVisionBoard, deleteVisionBoard } from "../../services/visionBoardAPI.js";
import VisionItem from "./VisionItem";
import AIRecommendation from "./AIRecommendation";
import FileUpload from "./FileUpload";
import "../../styles/VisionBoard.css";
import DrawingBoard from "./DrawingBoard";
import { Droppable } from "@hello-pangea/dnd";
import { Info, Home } from "lucide-react";
import { Link } from "react-router-dom";

const VisionBoard = ({ userId }) => {
  const [visionBoards, setVisionBoards] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);

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

  return (
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
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm mb-8 max-w-xl">
      <p className="text-center text-gray-700">
        "Your vision board is a visual representation of your future self. What you focus on expands."
      </p>
    </div>
      <h1 className="text-2xl font-bold text-center mb-5">My Vision Boards</h1>

      {/* Home button to navigate back to main page */}
      <Link to="/MainPage" className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center">
        <Home size={18} className="mr-1" />
        <span>Home</span>
      </Link>

      <div className="vision-board-container w-full max-w-4xl bg-white p-4 shadow-lg rounded-lg">
        {visionBoards.map((board) => (
          <div key={board._id} className="vision-board mb-5 p-3 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">{board.title}</h3>

            {/* Drag-and-drop support */}
            <Droppable droppableId={board._id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="vision-items p-3">
                  <VisionItem items={board.items} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <button
              onClick={() => handleDelete(board._id)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* AI-based recommendations */}
      <AIRecommendation userId={userId} fetchVisionBoards={fetchVisionBoards} />

      {/* File Upload for Vision Board */}
      <FileUpload userId={userId} fetchVisionBoards={fetchVisionBoards} />

      {/* Add Drawing Feature */}
      <DrawingBoard />

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
    </div>
  );
};

export default VisionBoard;