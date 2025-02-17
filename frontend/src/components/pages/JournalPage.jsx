import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JournalApp = () => {
  const navigate = useNavigate();
  const [entryText, setEntryText] = useState('');
  const [topic, setTopic] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [loadingSave, setLoadingSave] = useState(false); // Loading state for save button
  const [loadingAI, setLoadingAI] = useState(false); // Loading state for AI button
  const [loadingTopics, setLoadingTopics] = useState(false); // Loading state for topics button
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const token = sessionStorage.getItem("accessToken");

  const createEntry = async () => {
    try {
      setLoadingSave(true); // Set loading state for save entry
      const response = await fetch('http://localhost:8000/api/journals/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
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
      
      alert('Journal entry saved successfully!');
      setEntryText('');
      setTopic('');
      setMoodScore(5);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSave(false); // Reset loading state for save entry
    }
  };

  const getAiAssistance = async () => {
    try {
      setLoadingAI(true); // Set loading state for AI assistance
      const response = await fetch('http://localhost:8000/api/journals/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, moodScore }), // Send topic in the request body
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setAiSuggestions(data.suggestions);
      alert('AI suggestions received!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAI(false); // Reset loading state for AI assistance
    }
  };

  const getSuggestedTopics = async () => {
    try {
      setLoadingTopics(true); // Set loading state for topic ideas
      const response = await fetch('http://localhost:8000/api/journals/suggest', {
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
      alert('Topics retrieved successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingTopics(false); // Reset loading state for topic ideas
    }
  };

  return (
    <div className="flex align-middle justify-center bg-gradient-to-b from-black via-blue-950 to-black p-6 max-w-full mx-auto">
            <button 
        onClick={() => navigate('/MainPage')}
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Back To Main Page
      </button>
      <div className="bg-gray-800 center text-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="border-b border-gray-700 p-4">
          <h2 className="text-3xl font-semibold">Journal Entry</h2>
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
              disabled={loadingSave || !entryText}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loadingSave ? "Saving" : "Save Entry"}
            </button>

            <button
              onClick={getAiAssistance}
              disabled={loadingAI || !topic}
              className="relative flex-row px-6 py-2 text-white font-semibold rounded-lg overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition delay-150 duration-300 ease-in-out"></span>
              <span className="relative z-10">✨ Get AI Help</span>
            </button>

            <button
              onClick={getSuggestedTopics}
              disabled={loadingTopics}
              className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              Topic Ideas
            </button>
          </div>

          {/* AI Suggestions */}
          {/* AI Suggestions */}
{/* AI Suggestions */}
{/* AI Suggestions */}
{ aiSuggestions && (
    <div className="mt-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
      <h5 className="font-semibold text-amber-300 mb-4">AI Writing Suggestions</h5>
      <div className="text-gray-200">
        {typeof aiSuggestions === "string" ? (
          aiSuggestions.split("##").map((section, index) => {
            const [title, ...content] = section.trim().split("\n").filter(Boolean);
            const cleanTitle = title.replace(/\*\*/g, '').trim();
            const isContentSuggestions = cleanTitle.toLowerCase().includes('content suggestions');

            return (
              <div key={index} className="mb-6">
                {/* Apply the same amber styling to both Structure and Content Suggestions */}
                <h6 className="text-lg font-bold text-amber-300 mb-2">
                  {cleanTitle}
                </h6>
                <div className="text-gray-300 pl-4">
                  {content.map((line, lineIndex) => {
                    const cleanLine = line.replace(/\*\*/g, '');
                    
                    // If we're in the Content Suggestions section and the line starts with a bullet
                    if (isContentSuggestions && line.trim().startsWith('•')) {
                      return (
                        <div key={lineIndex} className="flex mb-2">
                          <span className="text-amber-300 mr-2">•</span>
                          <span>{cleanLine.replace('•', '').trim()}</span>
                        </div>
                      );
                    } 
                    // If we're in Structure section and line starts with a number
                    else if (!isContentSuggestions && /^\d+\./.test(line.trim())) {
                      return (
                        <div key={lineIndex} className="flex mb-2">
                          <span className="text-amber-300 mr-2">{line.match(/^\d+\./)[0]}</span>
                          <span>{cleanLine.replace(/^\d+\./, '').trim()}</span>
                        </div>
                      );
                    }
                    // Default case for other lines
                    else {
                      return <p key={lineIndex} className="mb-2">{cleanLine}</p>;
                    }
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No AI suggestions available or invalid response format.</p>
        )}
      </div>
    </div>)}

{/* Suggested Topics */}
{suggestedTopics.length > 0 && (
  <div className="mt-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
          <h5 className="font-semibold text-purple-300 mb-4">Suggested Topics</h5>
          <ul className="list-disc pl-5 text-gray-300">
            {suggestedTopics.map((topic, index) => {
              // Remove asterisks and split topic into title and description
              const cleanTopic = topic.replace(/\*\*/g, '');
              const splitTopic = cleanTopic.split(':');
              const title = splitTopic[0]?.trim();
              const description = splitTopic[1]?.trim();

              return (
                <li key={index} className="mb-4">
                  {/* Render the topic title */}
                  <p className="font-bold text-green-300 mb-1">{title}</p>
                  {/* Render the topic description */}
                  {description && <p className="text-sm text-gray-400">{description}</p>}
                </li>
              );
            })}
          </ul>
        </div>
)}

</div>
      </div>
    </div>
  );
};


export default JournalApp;
