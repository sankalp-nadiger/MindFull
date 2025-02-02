import React, { useState } from 'react';

const JournalApp = () => {
  const [entryText, setEntryText] = useState('');
  const [topic, setTopic] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState([]);

  const createEntry = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8000/api/journals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '678e87c5b00317631329f4c1', // Replace with actual user ID from auth
          entryText,
          topic,
          moodScore,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      alert('Journal entry saved successfully!');
      setEntryText('');
      setTopic('');
      setMoodScore(5);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAiAssistance = async () => {
    try {
      setLoading(true);
      
      // Changed from GET to POST since we're sending data
      const response = await fetch('http://localhost:8000/api/journals/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({ topic }), // Send topic in the request body
        
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setAiSuggestions(data.suggestions);
      alert('AI suggestions received!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedTopics = async () => {
    try {
      setLoading(true);
      
      // Simplified the request body
      const response = await fetch('http://localhost:8000/api/journals/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,  // Send current topic for context
          count: 5  // Request 5 suggestions
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setSuggestedTopics(data.topics || []);
      alert('Topics retrieved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex align-middle justify-center bg-gradient-to-b from-black via-blue-950 to-black p-6 max-w-full mx-auto">
  <div className="bg-gray-800  center text-white shadow-lg rounded-lg">
    {/* Header */}
    <div className="border-b border-gray-700 p-4">
      <h2 className="text-3xl font-semibold ">Journal Entry</h2>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
      {/* Topic Input */}
      <div>
        <label className="block mb-2 font-medium text-gray-300">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Mood Score */}
      <div>
        <label className="block mb-2 font-medium text-gray-300">Mood Score (1-10)</label>
        <input
          type="range"
          value={moodScore}
          onChange={(e) => setMoodScore(Number(e.target.value))}
          min="1"
          max="10"
          step="1"
          className="w-full accent-yellow-400"
        />
        <span className="text-sm text-gray-400">Current mood: {moodScore}/10</span>
      </div>

      {/* Journal Entry */}
      <div>
        <label className="block mb-2 font-medium text-gray-300">Journal Entry</label>
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
          rows="8"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={createEntry}
          disabled={loading || !entryText}
          className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>

        <button
          onClick={getAiAssistance}
          disabled={loading || !topic}
          className="relative flex-row  px-6 py-2 text-white font-semibold rounded-lg overflow-hidden group">
            <span class="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition delay-150 duration-300 ease-in-out"></span>
            <span class="relative z-10">✨ Get AI Help</span>
        </button>

        <button
          onClick={getSuggestedTopics}
          disabled={loading}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Topic Ideas
        </button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <div className="mt-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
          <h5 className="font-semibold text-amber-300 mb-2">AI Writing Suggestions</h5>
          <p className="text-gray-200">{aiSuggestions}</p>
        </div>
      )}

      {/* Suggested Topics */}
      {suggestedTopics.length > 0 && (
        <div className="mt-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
          <h5 className="font-semibold text-purple-300 mb-2">Suggested Topics</h5>
          <ul className="list-disc pl-5 text-green-300">
            {suggestedTopics.map((topic, index) => (
              <li key={index} className="mb-1">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default JournalApp;