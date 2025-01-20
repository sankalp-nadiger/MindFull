// JournalPage.jsx
import React, { useState } from "react";
import axios from "axios";

const JournalPage = () => {
  const [entryText, setEntryText] = useState("");
  const [topic, setTopic] = useState("");
  const [moodScore, setMoodScore] = useState(5); // Default mood score is 5
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/journal/create", {
        userId: "12345", // Replace with actual userId (from the logged-in user)
        entryText,
        topic,
        moodScore,
      });

      setSuggestions(response.data.suggestions);
      alert("Journal saved successfully!");
    } catch (error) {
      console.error("Error submitting journal:", error);
      alert("An error occurred while saving your journal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Write Your Journal</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write your thoughts here..."
          rows="10"
          cols="50"
          required
        ></textarea>
        <br />
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic (optional)"
        />
        <br />
        <input
          type="number"
          value={moodScore}
          onChange={(e) => setMoodScore(e.target.value)}
          min="1"
          max="10"
          placeholder="Mood score (1-10)"
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Journal"}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
