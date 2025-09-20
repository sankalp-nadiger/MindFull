import React from 'react';
import { useNavigate } from "react-router-dom";

const ExerciseCards = () => {
    const navigate = useNavigate();
    const handleclick = () => {
        navigate("/Breathingexercise");
      };

  return (
    <div className="min-h-screen  text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
         <div className="flex align-middle justify-center  py-5  ">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold pb-9 text-white">
  Additional Exercises
</h1>

          </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Exercise Card 1 */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all">
          <img
            src="kumbhaka.jpg"
            alt="Exercise 1"
            className="w-full h-56 object-cover group-hover:opacity-80 transition-all"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white">Kumbhaka</h2>
            <p className="text-lg text-gray-400 my-4">
              A great exercise to help in improving lung capacity, oxygen intake, and can promote relaxation and mental clarity.
            </p>
            <button
              onClick={handleclick}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              Start Exercise
            </button>
          </div>
        </div>

        

        {/* Coming Soon Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all">
          <div className="w-full h-56 bg-gray-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">Coming Soon</span>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white"></h2>
            <p className="text-lg text-gray-400 my-4">
              Stay tuned! A fun cardio exercise that will get your heart pumping and your body moving.
            </p>
            <button
              disabled
              className="px-6 py-2 bg-gray-500 cursor-not-allowed text-white font-semibold rounded-full"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCards;
