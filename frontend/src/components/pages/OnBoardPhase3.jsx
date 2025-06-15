import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OnboardPhase3 = () => {
  const [responses, setResponses] = useState({
    anxiety: 0,
    depression: 0,
    bipolar: 0,
    ocd: 0,
    ptsd: 0,
    substance: 0,
    adhd: 0,
    eating: 0,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: Number(value), // Store numerical values
    }));
  };

  const determineSeverity = (score) => {
    if (score >= 4) return "High"; 
    if (score === 3) return "Moderate"; 
    return "Low";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found!");
      return;
    }
    
    const diagnosedIssues = Object.entries(responses)
      .filter(([_, score]) => score > 0)
      .map(([key, score]) => {
        // Map the frontend keys to the exact backend expected values
        const issueNameMap = {
          'anxiety': 'Anxiety',
          'depression': 'Depression',
          'bipolar': 'Bipolar',
          'ocd': 'Ocd',
          'ptsd': 'PTSD', // Fix: Use uppercase PTSD
          'substanceUse': 'Substance Use',
          'adhd': 'ADHD',
          'eatingDisorders': 'Eating Disorders'
        };
        
        return {
          illnessType: issueNameMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
          severity: determineSeverity(score)
        };
      });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/add-issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ diagnosed_issues: diagnosedIssues }), // This matches backend's expected format
      });
      
      if (!response.ok) {
        throw new Error("Failed to save issues");
      }
      
      console.log("Issues saved successfully!");
      navigate("/MainPage");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 text-white bg-gradient-to-b from-black via-blue-950 to-black">
      <h2 className="mb-6 text-3xl font-semibold text-white">Let's know you more!!</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg">
        {[
          {
            name: "anxiety",
            question:
              "You’re getting ready for a big event, but the thought of it keeps you up all night. Do you often feel anxious about things that might not happen?",
          },
          {
            name: "depression",
            question:
              "You’re sitting with friends who are laughing and enjoying themselves, but you feel like you can’t join in. Do you often feel disconnected or uninterested in things you used to enjoy?",
          },
          {
            name: "bipolar",
            question:
              "One day, you feel like you can take on the world, full of energy and ideas, but the next day, it’s hard to even get out of bed. Do you experience drastic changes in your energy and mood?",
          },
          {
            name: "ocd",
            question:
              "You leave your house and suddenly feel the urge to go back and check if the door is locked—even though you already did. Do you often feel the need to repeat actions or check things multiple times to feel secure?",
          },
          {
            name: "ptsd",
            question:
              "A sudden loud noise reminds you of a past event, and your heart starts racing. Do you often feel jumpy or on edge because of something that happened in the past?",
          },
        ].map(({ name, question }) => (
          <div key={name} className="mb-6">
            <label className="block mb-2 font-semibold text-white">{question}</label>
            {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
              <div key={`${name}-${index}`} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={name}
                  value={index}
                  onChange={handleChange}
                  className="text-indigo-500 form-radio focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        ))}

        <div className="text-center">
          <button type="submit" className="px-6 py-2 text-white transition-all bg-green-500 rounded-lg hover:bg-green-600">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardPhase3;
