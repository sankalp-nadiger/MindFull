import React from 'react';
import { useNavigate } from "react-router-dom";

const ExerciseCards = () => {
    const navigate = useNavigate();
    const handleclick = () => {
        navigate("/Breathingexercise");
      };

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
         <div className="flex align-middle justify-center py-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold pb-9 text-white">
            Exercises & Games
          </h1>
        </div>
        
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
        {/* Exercise Card 1 */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
          <img
            src="kumbhaka.jpg"
            alt="Exercise 1"
            className="w-full h-32 object-cover group-hover:opacity-80 transition-all"
          />
          <div className="p-5">
            <h2 className="text-xl font-bold text-white">Kumbhaka</h2>
            <p className="text-base text-gray-400 my-3">
              A great exercise to help in improving lung capacity, oxygen intake, and can promote relaxation and mental clarity.
            </p>
            <button
              onClick={handleclick}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              Start Exercise
            </button>
          </div>
        </div>

        {/* Coming Soon Card */}
       <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
  <div className="w-full h-32 bg-gray-600 flex items-center justify-center">
    <span className="text-2xl font-bold text-white">Coming Soon</span>
  </div>
  <div className="p-5 flex flex-col items-center justify-center text-center h-40">
    <h2 className="text-xl font-bold text-white"></h2>
    <p className="text-base text-gray-400">
      Stay tuned! A fun cardio exercise that will get your heart pumping and your body moving.
    </p>
  </div>
</div>
      </div>
    </div>
  );
};

export default ExerciseCards;