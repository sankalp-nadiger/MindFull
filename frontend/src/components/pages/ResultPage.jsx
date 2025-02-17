// ResultPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResultPage = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch recommendations on page load
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Assuming userId is available
        const userId = "678eb93145dd095192be902d"; // Replace with actual user ID
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/create-resource`, {
          userId,
          // Include other necessary fields like interests, goals, etc.
        });

        setRecommendations(response.data.data); // Store the fetched recommendations
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  return (
    <div>
      <h1>Recommended Resources</h1>
      <div>
        {recommendations && Object.keys(recommendations).length > 0 ? (
          Object.entries(recommendations).map(([type, resources]) => (
            <div key={type}>
              <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
              {resources.length > 0 ? (
                resources.map((resource, index) => (
                  <div key={index} className="resource-item">
                    <h3>{resource.title}</h3>
                    <p>{resource.content}</p>
                  </div>
                ))
              ) : (
                <p>No {type} recommendations available.</p>
              )}
            </div>
          ))
        ) : (
          <p>No recommendations available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
