import React, { useState } from "react";
import axios from "axios"; // Using axios for API calls

const SaveMood = () => {
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");

  const handleSaveMood = async () => {
    try {
      const userId = "678f778d957045a1f369bdec" // Assuming userId is stored in localStorage
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/mood`, {
        userId,
        mood,
      });
      setMessage("Mood saved successfully!");
      console.log("Saved mood:", response.data);
    } catch (error) {
      setMessage("Failed to save mood");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Log Your Mood</h2>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="">Select Mood</option>
        <option value="Happy">Happy</option>
        <option value="Sad">Sad</option>
        <option value="Neutral">Neutral</option>
        <option value="Anxious">Anxious</option>
        <option value="Excited">Excited</option>
        <option value="Angry">Angry</option>
      </select>
      <button onClick={handleSaveMood}>Save Mood</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SaveMood;
