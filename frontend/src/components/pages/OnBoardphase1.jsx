import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
const OnBoardphase1 = () => {
    const url="localhost:5173/phase2"
  const [answers, setAnswers] = useState({
    mentalWellBeing: '',
    feelOverwhelmed: false,
    sleepWell: '',
    someoneToTalk: false,
    physicalSymptoms: '',
  });
  const navigate=useNavigate();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnswers({
      ...answers,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Answers:', answers);
    navigate('/phase2');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6 py-10">
  <h2 className="text-3xl font-semibold text-center text-yellow-500 mb-6">
    Let's Get to Know You Better
  </h2>

  <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
    
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-gray-300 mb-2">
        On a scale of 1-10, how would you rate your mental well-being today?
      </label>
      <input
        type="number"
        name="mentalWellBeing"
        value={answers.mentalWellBeing}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
        min="1"
        max="10"
        required
      />
    </div>

    
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-gray-300 mb-2">
        Do you often feel overwhelmed by stress or responsibilities?
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="feelOverwhelmed"
          checked={answers.feelOverwhelmed}
          onChange={handleInputChange}
          className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-400"
        />
        <label className="text-gray-300">Yes</label>
      </div>
    </div>


    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-gray-300 mb-2">
        Are you able to sleep well and feel rested when you wake up?
      </label>
      <input
        type="text"
        name="sleepWell"
        value={answers.sleepWell}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
        placeholder="E.g., Yes, No, Sometimes"
        required
      />
    </div>

  
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-gray-300 mb-2">
        Do you feel like you have someone you can talk to when you're feeling down?
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="someoneToTalk"
          checked={answers.someoneToTalk}
          onChange={handleInputChange}
          className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-400"
        />
        <label className="text-gray-300">Yes</label>
      </div>
    </div>

  
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-gray-300 mb-2">
        Have you noticed any physical symptoms (like fatigue, headaches, or muscle tension) related to stress or emotions?
      </label>
      <textarea
        name="physicalSymptoms"
        value={answers.physicalSymptoms}
        onChange={handleInputChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
        placeholder="Describe your symptoms here"
        rows="3"
        required
      ></textarea>
    </div>

  
    <div className="text-center">
      <button type="submit" className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
        Next
      </button>
    </div>
  </form>
</div>

  );
};

export default OnBoardphase1;
