import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
 // Include the CSS file for styling

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

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: Number(value), // Ensure value is saved as a number
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Responses to be sent:", responses);
    // Assuming the API call is successful, navigate to the main page
    // Replace with your API call
    // If your API call is successful, navigate to the main page:
    navigate("/MainPage"); // Change "/main" to the actual route of your main page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6 py-10">
  <h2 className="text-3xl font-semibold text-white mb-6">Let's know you more!!</h2>

  <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
    
    <div className="mb-6">
      <label className="block text-white font-semibold mb-2">
        You’re getting ready for a big event, but the thought of it keeps you up all night.
        Do you often feel anxious about things that might not happen?
      </label>
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
        <div key={`anxiety-${index}`} className="flex items-center mb-2">
          <input
            type="radio"
            name="anxiety"
            value={index}
            onChange={handleChange}
            className="form-radio text-indigo-500 focus:ring-indigo-400"
          />
          <span className="ml-2 text-gray-400">{label}</span>
        </div>
      ))}
    </div>

    {/* Depression */}
    <div className="mb-6">
      <label className="block text-white font-semibold mb-2">
        You’re sitting with friends who are laughing and enjoying themselves, but you feel like you can’t join in.
        Do you often feel disconnected or uninterested in things you used to enjoy?
      </label>
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
        <div key={`depression-${index}`} className="flex items-center mb-2">
          <input
            type="radio"
            name="depression"
            value={index}
            onChange={handleChange}
            className="form-radio text-indigo-500 focus:ring-indigo-400"
          />
          <span className="ml-2 text-gray-400">{label}</span>
        </div>
      ))}
    </div>

    {/* Bipolar Disorder */}
    <div className="mb-6">
      <label className="block text-white font-semibold  mb-2">
        One day, you feel like you can take on the world, full of energy and ideas, but the next day, it’s hard to even get out of bed.
        Do you experience drastic changes in your energy and mood?
      </label>
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
        <div key={`bipolar-${index}`} className="flex items-center mb-2">
          <input
            type="radio"
            name="bipolar"
            value={index}
            onChange={handleChange}
            className="form-radio text-indigo-500 focus:ring-indigo-400"
          />
          <span className="ml-2 text-gray-400">{label}</span>
        </div>
      ))}
    </div>

    {/* Obsessive-Compulsive Disorder */}
    <div className="mb-6">
      <label className="block text-white font-semibold mb-2">
        You leave your house and suddenly feel the urge to go back and check if the door is locked—even though you already did.
        Do you often feel the need to repeat actions or check things multiple times to feel secure?
      </label>
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
        <div key={`ocd-${index}`} className="flex items-center mb-2">
          <input
            type="radio"
            name="ocd"
            value={index}
            onChange={handleChange}
            className="form-radio text-indigo-500 focus:ring-indigo-400"
          />
          <span className="ml-2 text-gray-400">{label}</span>
        </div>
      ))}
    </div>

    {/* PTSD */}
    <div className="mb-6">
      <label className="block text-white font-semibold mb-2">
        A sudden loud noise reminds you of a past event, and your heart starts racing.
        Do you often feel jumpy or on edge because of something that happened in the past?
      </label>
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((label, index) => (
        <div key={`ptsd-${index}`} className="flex items-center mb-2">
          <input
            type="radio"
            name="ptsd"
            value={index}
            onChange={handleChange}
            className="form-radio text-indigo-500 focus:ring-indigo-400"
          />
          <span className="ml-2 text-gray-400">{label}</span>
        </div>
      ))}
    </div>

    <div className="text-center">
      <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
        Submit
      </button>
    </div>
  </form>
</div>

  );
};

export default OnboardPhase3;
