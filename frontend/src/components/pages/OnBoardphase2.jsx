import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    const userId = "678eb93145dd095192be902d" // Replace this with the actual user ID (from context, auth, or props)
    
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    const userData = {
      userId, // Add userId to the request body
      selected_interests: selectedTopics,
      isGoal: goal ? true : false, // Set isGoal based on whether any goal is provided
       // Send the single goal value
    };

    try {
      setIsSubmitting(true);
      // API call to save user goals and interests
      const response = await axios.patch("http://localhost:8000/api/users/add-interests", userData);
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
    <div className="container">
      <h1>Welcome! Let's Get Started</h1>
      <p>Set your goal and select your interests to personalize your experience.</p>
      {/* Goal Section */}
      <div className="goal-section">
        <h2>Set Your Goal</h2>
        <div className="form-group">
          <label htmlFor="goal">Goal</label>
          <textarea
            id="goal"
            className="form-control"
            placeholder="Enter your goal..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
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
            (!goal && selectedTopics.length === 0)
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
