import React, { useState } from "react";
import { getAIImage, getAIQuote, updateVisionBoard } from "../../services/visionBoardAPI";

const AIRecommendation = ({ userId, fetchVisionBoards }) => {
  const [category, setCategory] = useState("");
  const [suggestedImage, setSuggestedImage] = useState("");
  const [suggestedQuote, setSuggestedQuote] = useState("");

  const fetchAIContent = async () => {
    const image = await getAIImage(category);
    const quote = await getAIQuote(category);
    setSuggestedImage(image);
    setSuggestedQuote(quote);
  };

  const addToVisionBoard = async () => {
    await updateVisionBoard(userId, { items: [{ type: "image", content: suggestedImage }, { type: "quote", content: suggestedQuote }] });
    fetchVisionBoards();
  };

  return (
    <div className="ai-recommendation">
      <h3>AI-Powered Vision Board Suggestions</h3>
      <input type="text" placeholder="Enter goal category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <button onClick={fetchAIContent}>Generate AI Suggestions</button>
      {suggestedImage && <img src={suggestedImage} alt="AI Suggestion" />}
      {suggestedQuote && <p>{suggestedQuote}</p>}
      <button onClick={addToVisionBoard}>Add to Vision Board</button>
    </div>
  );
};

export default AIRecommendation;
