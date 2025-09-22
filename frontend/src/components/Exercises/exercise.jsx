import React from 'react';
import { useNavigate } from "react-router-dom";

const ExerciseCards = () => {
    const navigate = useNavigate();
    const handleclickex1 = () => {
        navigate("/Breathingexercise");
      };
    const handleclickex2 = () => {
        navigate("/boxbreathing");
      };
       const handleclickex3 = () => {
        navigate("/MahamrityunjayaBreathing");
      };

  return (
    <div className="min-h-screen z-50  py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4">
                Serenity Sessions
              </h1>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-medium">
                Exercises for Mind and Body
              </h3>
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
              onClick={handleclickex1}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              Start Exercise
            </button>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
          <img
            src="https://plus.unsplash.com/premium_photo-1734360484487-7a39662175dc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODV8fGJyZWF0aGluZ3xlbnwwfHwwfHx8MA%3D%3D"
            alt="Exercise 2"
            className="w-full h-32 object-cover group-hover:opacity-80 transition-all"
          />
          <div className="p-5">
            <h2 className="text-xl font-bold text-white">Box breathing</h2>
            <p className="text-base text-gray-400 my-3">
              A simple yet effective way to calm the nervous system, manage stress, and improve focus by activating the parasympathetic nervous system. 
            </p>
            <button
              onClick={handleclickex2}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              Start Exercise
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
          <img
            src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWVkaXRhdGlvbnxlbnwwfHwwfHx8MA%3D%3D"
            alt="Exercise 2"
            className="w-full h-32 object-cover group-hover:opacity-80 transition-all"
          />
          <div className="p-5">
            <h2 className="text-xl font-bold text-white">Mahamrityunjaya Breathing</h2>
            <p className="text-base text-gray-400 my-3">
              A common method to divide the mantra and coordinate it with breaths, inhaling and exhaling through one nostril for each part of the mantra as part of a Nadi Shodhana Pranayama practice
            </p>
            <button
              onClick={handleclickex3}
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