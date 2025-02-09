import { useState, useEffect } from "react";

export default function Suggestion() {
  // Mock data for suggested activity
  const [suggestedActivity, setSuggestedActivity] = useState(null);

  useEffect(() => {
    // Fetch activity from sessionStorage or API
    const activity = sessionStorage.getItem("activity");  // Can replace with API call if needed
    setSuggestedActivity(JSON.parse(activity)); // Assuming the activity is stored as a stringified object
  }, []);

  return (
    <div className="shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)] transition duration-300 p-6  bg-black w-full">
      <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 bg-opacity-70 p-8 rounded-lg shadow-lg shadow-red-500/50 hover:shadow-blue-500/50 transition-shadow flex align-middle justify-center">
        {suggestedActivity ? (
          <div>
            <h2 className="text-3xl font-semibold mb-6">Your To-Do Today:</h2>
            <h3 className="text-2xl font-medium text-purple-400">{suggestedActivity.title}</h3>
            <p className="text-lg mt-4">{suggestedActivity.content}</p>
            <div className="mt-4 text-lg text-gray-400">
              Type: {suggestedActivity.type}
            </div>

            <div className="mt-6 flex items-center">
              <input
                type="checkbox"
                id="completed"
                className="w-5 h-5 mr-3"
                // onChange={handleCompletedChange} 
              />
              <label htmlFor="completed" className="text-lg cursor-pointer">
                Completed
              </label>
            </div>
          </div>
        ) : (
          <p>Loading suggested activity...</p>
        )}
      </div>
    </div>
  );
}
