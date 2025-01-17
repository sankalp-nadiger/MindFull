import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const handleSubmit = () => {
    const userData = {
      shortTermGoals,
      longTermGoals,
      selectedTopics,
    };

    // Log the user data for now
    console.log("User Data:", userData);
    alert("Your goals and interests have been saved!");

    // Navigate to Phase 3
    navigate("/phase3");
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
            !shortTermGoals && !longTermGoals && selectedTopics.length === 0
          }
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default OnBoardingPhase;
