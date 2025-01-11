import React, { useState } from "react";
import "../Tags.css"; // Add your styles here

// List of topics for interests
const topicsList = [
  "System Design",
  "App Development",
  "Binary Search Tree",
  "DSA",
  "Web Development",
  "DevOps",
  "Artificial Intelligence",
  "React",
  "Machine Learning",
  "Data Science",
  "Semester Exams",
  "Cloud Computing",
  "Full Stack",
  "Frontend",
  "Backend",
  "Networking",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
];

const OnBoardingPhase = () => {
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Toggle function to select or deselect topics
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      // Deselect if already selected
      setSelectedTopics(selectedTopics.filter((item) => item !== topic));
    } else {
      // Select if not already selected
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Check if the topic is selected
  const isSelected = (topic) => selectedTopics.includes(topic);

  // Handle submission (simply log selected topics for frontend-only)
  const handleSubmit = () => {
    // Log selected topics to the console or save them in localStorage
    console.log("Selected Topics:", selectedTopics);

    // Optionally, save to localStorage if you want to persist the selection
    localStorage.setItem("userSelectedTopics", JSON.stringify(selectedTopics));
    alert("Your interests have been saved!");
  };

  return (
    <div className="container">
      <h1>Select Your Interests</h1>
      <p>Pick one or more topics to personalize your experience</p>
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
      <div className="actions">
        <button
          className="submit-button"
          disabled={selectedTopics.length === 0}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default OnBoardingPhase;
