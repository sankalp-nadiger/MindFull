import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Add your styles here

// List of topics for interests
const topicsList = [
  "Photography",
  "Gardening",
  "Cooking/Baking",
  "Music",
  "Fitness",
  "Reading/Writing",
  "DIY Projects",
  "Sketching/Drawing",
  "Coding",
  "Gaming",
];

const OnBoardingPhase = () => {
  const [goal, setGoal] = useState("");  // Single goal state
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Toggle function to select or deselect topics
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Check if the topic is selected
  const isSelected = (topic) => selectedTopics.includes(topic);

  // Handle submission
  const handleSubmit = async () => {
    const userData = {
      selected_interests: selectedTopics,
      goal
    };
  
    try {
      setIsSubmitting(true);
      
      // Retrieve the access token from sessionStorage
      const accessToken = sessionStorage.getItem("accessToken");
      
      if (!accessToken) {
        alert("Some error has occured. Please try to sign up again.");
        return;
      }
  
      // API call to save user goals and interests
      const response = await axios.patch(
        "http://localhost:8000/api/users/add-interests", 
        userData, 
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}` // Include access token in the header
          }
        }
      );
      
      console.log("Response:", response.data);
      alert("Your goal and interests have been saved!");
      
      // Navigate to Phase 3
      navigate("/phase3");
  
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save your goal and interests. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-b from-black via-blue-950 to-black text-white px-6 py-10">
  <h1 className="text-3xl font-semibold text-green-500 mb-3 text-center">
    Welcome! Let's Get Started
  </h1>
  <p className="text-yellow-300 text-center mb-6">
    Set your goal and select your interests to personalize your experience.
  </p>

  {/* Goal Section */}
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
    <h2 className="text-xl font-semibold text-indigo-300 mb-3">Set Your Goal</h2>
    <div className="form-group">
      <label htmlFor="goal" className="block text-gray-300 mb-2">
        Goal
      </label>
      <textarea
        id="goal"
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
        placeholder="Enter your goal..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
    </div>
  </div>

  {/* Interests Section */}
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg mt-6">
    <h2 className="text-xl font-semibold text-indigo-300 mb-3">Select Your Interests</h2>
    <p className="text-gray-400 mb-4">Pick one or more topics to personalize your experience.</p>
    <div className="flex flex-wrap gap-2">
      {topicsList.map((topic, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-lg transition-all ${
            isSelected(topic) ? "bg-yellow-600 text-black font-bold" : "bg-yellow-600 text-white font-semibold hover:bg-yellow-700 hover:text-white"
          }`}
          onClick={() => toggleTopic(topic)}
        >
          {topic} {isSelected(topic) ? "✔️" : "+"}
        </button>
      ))}
    </div>
  </div>

  {/* Submit Button */}
  <div className="mt-6">
    <button
      className="w-full max-w-lg py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-600"
      disabled={isSubmitting || (!goal && selectedTopics.length === 0)}
      onClick={handleSubmit}
    >
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  </div>
</div>

  );
};

export default OnBoardingPhase;
