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
<div className="max-w-4xl mx-auto my-8 p-6 backdrop-blur-lg bg-opacity-80 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-green-500/50 transition-shadow">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold text-white mb-6">
          {isNegativeMood ? "Revisit Some Happy Memories" : "More Joyful Moments Like Today"}
        </h2>

        {journalEntries.length === 0 ? (
          <p className="text-xl text-gray-300">No journal entries found yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(showAll ? journalEntries : getRandomEntries(journalEntries, 3)).map((entry, index) => (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{new Date(entry.entryDate).toLocaleDateString()}</span>
                    <span className="text-2xl">
                      {entry.moodScore <= 3 ? '😔' : entry.moodScore <= 5 ? '😐' : entry.moodScore <= 7 ? '🙂' : entry.moodScore <= 9 ? '😊' : '🤩'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{entry.topic}</h3>
                  <p className="text-gray-300">
                    {expandedEntry === index ? entry.entryText : `${entry.entryText.substring(0, 150)}...`}
                  </p>
                  <button
                    className="mt-4 text-violet-400 hover:text-violet-300 font-medium"
                    onClick={() => setExpandedEntry(expandedEntry === index ? null : index)}
                  >
                    {expandedEntry === index ? "Show Less" : "Read Full Memory"}
                  </button>
                </motion.div>
              ))}
            </div>
            <button
              className="mt-6 bg-violet-600 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Fewer Memories" : "View All Journals"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MoodBasedMemories;
