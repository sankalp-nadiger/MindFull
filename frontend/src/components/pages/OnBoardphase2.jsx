import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For API calls
import "./Tags.css"; // Add your styles here

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
  const [shortTermGoals, setShortTermGoals] = useState("");
  const [longTermGoals, setLongTermGoals] = useState("");
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
    // Assuming you have a way to get the current logged-in user's ID
    const userId = localStorage.getItem("userId"); // Replace this with the actual user ID (from context, auth, or props)
    
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    const userData = {
      userId,
      selected_interests: selectedTopics,
      isGoal: shortTermGoals || longTermGoals ? true : false, // Set isGoal based on whether any goals are provided
    };

    try {
      setIsSubmitting(true);
      // API call to save user goals and interests
      const response = await axios.post("http://localhost:8000/api/users/add-intersts", userData);
      console.log("Response:", response.data);
      alert("Your goals and interests have been saved!");
      // Navigate to Phase 3
      navigate("/phase3");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save your goals and interests. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Welcome! Let's Get Started</h1>
      <p>Set your goals and select your interests to personalize your experience.</p>
      {/* Goals Section */}
      <div className="goals-section">
        <h2>Set Your Goals</h2>
        <div className="form-group">
          <label htmlFor="shortTermGoals">Short-Term Goals</label>
          <textarea
            id="shortTermGoals"
            className="form-control"
            placeholder="Enter your short-term goals..."
            value={shortTermGoals}
            onChange={(e) => setShortTermGoals(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="longTermGoals">Long-Term Goals</label>
          <textarea
            id="longTermGoals"
            className="form-control"
            placeholder="Enter your long-term goals..."
            value={longTermGoals}
            onChange={(e) => setLongTermGoals(e.target.value)}
          />
        </div>
      </div>
      {/* Interests Section */}
      <div className="interests-section">
        <h2>Select Your Interests</h2>
        <p>Pick one or more topics to personalize your experience.</p>
        <div className="topics-container">
          {topicsList.map((topic, index) => (
            <button
              key={index}
              className={`topic-button ${isSelected(topic) ? "selected" : ""}`}
              onClick={() => toggleTopic(topic)}
            >
              {topic} {isSelected(topic) ? "✔️" : "+"}
            </button>
          ))}
        </div>
      </div>
      {/* Submit Button */}
      <div className="actions">
        <button
          className="submit-button"
          disabled={
            isSubmitting ||
            (!shortTermGoals && !longTermGoals && selectedTopics.length === 0)
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default OnBoardingPhase;