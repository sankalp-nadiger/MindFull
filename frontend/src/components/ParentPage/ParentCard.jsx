import React from 'react';

const ParentDashboardCard = () => {
  // Dummy data for child mental health metrics
  const childInsights = {
    mood: "Good",  // This can be a score or text indicating mood
    stressLevel: "Low", // Stress level (e.g., Low, Moderate, High)
    sleepQuality: "Excellent", // Sleep quality (e.g., Excellent, Good, Fair, Poor)
    lastChecked: "January 18, 2025", // Date of the last update
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg text-gray-800">
      <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
        Parent Dashboard
      </h2>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Mood Score</div>
          <div className="text-xl text-green-500 font-semibold">{childInsights.mood}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Stress Level</div>
          <div className="text-xl text-red-500 font-semibold">{childInsights.stressLevel}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Sleep Quality</div>
          <div className="text-xl text-blue-500 font-semibold">{childInsights.sleepQuality}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Last Checked</div>
          <div className="text-xl text-gray-600">{childInsights.lastChecked}</div>
        </div>
      </div>
      
      {/* Optional Footer Section */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-200">
          View Detailed Insights
        </button>
      </div>
    </div>
  );
};

export default ParentDashboardCard;
