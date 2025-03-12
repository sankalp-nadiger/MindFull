import React, { useState } from "react";
import { getAIImage, getAIQuote, updateVisionBoard } from "../../services/visionBoardAPI";

const AIRecommendation = ({ userId, fetchVisionBoards }) => {
  const [category, setCategory] = useState("");
  const [suggestedImage, setSuggestedImage] = useState("");
  const [suggestedQuote, setSuggestedQuote] = useState("");
  const [includeImage, setIncludeImage] = useState(false);
  const [includeQuote, setIncludeQuote] = useState(false);

  const fetchAIContent = async () => {
    if (includeImage) {
      const image = await getAIImage(category);
      setSuggestedImage(image);
    }
    if (includeQuote) {
      const quote = await getAIQuote(category);
      setSuggestedQuote(quote);
    }
  };

  const addToVisionBoard = async () => {
    const items = [];
    if (suggestedImage) items.push({ type: "image", content: suggestedImage });
    if (suggestedQuote) items.push({ type: "quote", content: suggestedQuote });

    if (items.length > 0) {
      await updateVisionBoard(userId, { items });
      fetchVisionBoards();
    }
  };

  return (
    <div className="ai-recommendation flex flex-col space-y-4 p-4">
      <h3 className="text-lg font-semibold">AI-Powered Vision Board Suggestions</h3>
  
      <input
        type="text"
        placeholder="Enter goal category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
  
      <div className="flex flex-col space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeImage}
            onChange={() => setIncludeImage(!includeImage)}
          />
          <span>Include AI-Generated Image</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeQuote}
            onChange={() => setIncludeQuote(!includeQuote)}
          />
          <span>Include AI-Generated Quote</span>
        </label>
      </div>
  
      <button
        onClick={fetchAIContent}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        Generate AI Suggestions
      </button>
  
      {suggestedImage && <img src={suggestedImage} alt="AI Suggestion" className="rounded-md shadow-md" />}
      {suggestedQuote && <p className="text-gray-700 font-medium">{suggestedQuote}</p>}
  
      <button
        onClick={addToVisionBoard}
        className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
      >
        Add to Vision Board
      </button>
    </div>
  );
  
};

export default AIRecommendation;
