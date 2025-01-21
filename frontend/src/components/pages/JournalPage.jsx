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
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Journal Entry</h2>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mood Score (1-10)</label>
            <input
              type="range"
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              min="1"
              max="10"
              step="1"
              className="w-full"
            />
            <span className="text-sm text-gray-600">Current mood: {moodScore}/10</span>
          </div>

          <div>
            <label className="block mb-1 font-medium">Journal Entry</label>
            <textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-2 border rounded"
              rows="6"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={createEntry}
              disabled={loading || !entryText}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>

            <button
              onClick={getAiAssistance}
              disabled={loading || !topic}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Get AI Help
            </button>

            <button
              onClick={getSuggestedTopics}
              disabled={loading}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Topic Ideas
            </button>
          </div>

          {aiSuggestions && (
            <div className="mt-4 border rounded p-4">
              <h5 className="font-bold mb-2">AI Writing Suggestions</h5>
              <p>{aiSuggestions}</p>
            </div>
          )}

          {suggestedTopics.length > 0 && (
            <div className="mt-4 border rounded p-4">
              <h5 className="font-bold mb-2">Suggested Topics</h5>
              <ul className="list-disc pl-4">
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