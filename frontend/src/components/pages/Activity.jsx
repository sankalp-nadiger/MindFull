import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";

const ActivityRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]); // Store activity recommendations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/activity/recommendations`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch recommendations");
        }

        setRecommendations(data.data || []); // Store the recommendations
      } catch (err) {
        setError(err.message); // Handle errors
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchRecommendations(); // Trigger the fetch
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 h-screen bg-gradient-to-b from-black via-blue-900 to-black">
      <Navbar/>
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Recommended Activities</h2>
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-transparent text-white shadow-2xl rounded-lg p-6 border border-gray-700 hover:shadow-3xl transition-transform transform hover:scale-105"
            >
              <h3 className="text-2xl font-extrabold text-indigo-400 mb-4">{rec.title}</h3>
              <p className="text-gray-400 text-sm mb-3">
                <strong className="text-gray-300">Type:</strong> {rec.type}
              </p>
              <p className="text-gray-300">{rec.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No recommendations available at the moment.</div>
      )}
    </div>
  );
};

export default ActivityRecommendations;
