import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MoodBasedMemories = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const belowNeutralMoods = ['Sad', 'Tired', 'Angry'];
  const isNegativeMood = belowNeutralMoods.includes(sessionStorage.getItem('mood'));

  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        setLoading(true);
        const accessToken = sessionStorage.getItem("accessToken");

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/journal-entries`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
       
        if (!data.journals || !Array.isArray(data.journals)) {
          throw new Error("Invalid data format: 'journals' key missing or not an array");
        }

        let filteredEntries = data.journals;
        if (isNegativeMood) {
          filteredEntries = filteredEntries.filter((entry) => entry.moodScore >= 7);
        } else {
          filteredEntries = filteredEntries.filter((entry) => entry.moodScore >= 5);
        }

        const randomEntries = getRandomEntries(filteredEntries, 3);
        setJournalEntries(randomEntries);
      } catch (err) {
        console.error("Error fetching journal entries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalEntries();
  }, [sessionStorage.getItem('mood'), isNegativeMood]);

  const getRandomEntries = (entries, count) => {
    if (entries.length <= count) return entries;
    const shuffled = [...entries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  if (loading) {
    return <div className="text-white text-xl">Loading your memories...</div>;
  }

  if (error) {
    return <div className="text-red-400">Couldn't load your memories. Try again later.</div>;
  }

  return (
      <div className="w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isNegativeMood ? "Revisit Some Happy Memories" : "More Joyful Moments Like Today"}
        </h2>
        
        {journalEntries.length === 0 ? (
          <p className="text-xl text-gray-300 text-center">No journal entries found yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {(showAll ? journalEntries : getRandomEntries(journalEntries, 3)).map((entry, index) => (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 p-4 rounded-lg h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{new Date(entry.entryDate).toLocaleDateString()}</span>
                    <span className="text-xl">
                      {entry.moodScore <= 3 ? '😔' : entry.moodScore <= 5 ? '😐' : entry.moodScore <= 7 ? '🙂' : entry.moodScore <= 9 ? '😊' : '🤩'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{entry.topic}</h3>
                  <p className="text-gray-300 text-sm flex-grow">
                    {expandedEntry === index ? entry.entryText : `${entry.entryText.substring(0, 120)}...`}
                  </p>
                  <button
                    className="mt-3 text-violet-400 hover:text-violet-300 text-sm font-medium self-start"
                    onClick={() => setExpandedEntry(expandedEntry === index ? null : index)}
                  >
                    {expandedEntry === index ? "Show Less" : "Read Full Memory"}
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button
                className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-6 rounded-md font-medium transition"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Fewer Memories" : "View All Journals"}
              </button>
            </div>
          </>
        )}
      </div>
  );
};


export default MoodBasedMemories;
