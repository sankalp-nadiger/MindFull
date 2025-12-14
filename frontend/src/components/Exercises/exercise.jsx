import React from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const ExerciseCards = () => {
    const { t } = useTranslation();
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
    <div className="min-h-screen z-50  pt-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4">
                {t('exercises.title')}
              </h1>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-medium">
                {t('exercises.subtitle')}
              </h3>
            </div>
        
      <div className="max-w-9xl  mx-auto flex flex-wrap justify-center gap-8">
        {/* Exercise Card 1 */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
          <img
            src="kumbhaka.jpg"
            alt="Exercise 1"
            className="w-full h-32 object-cover group-hover:opacity-80 transition-all"
          />
          <div className="p-5">
            <h2 className="text-xl font-bold text-white">{t('exercises.kumbhaka.title')}</h2>
            <p className="text-base text-gray-400 my-3">
              {t('exercises.kumbhaka.description')}
            </p>
            <button
              onClick={handleclickex1}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              {t('exercises.kumbhaka.button')}
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
            <h2 className="text-xl font-bold text-white">{t('exercises.boxBreathing.title')}</h2>
            <p className="text-base text-gray-400 my-3">
              {t('exercises.boxBreathing.description')}
            </p>
            <button
              onClick={handleclickex2}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              {t('exercises.boxBreathing.button')}
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
            <h2 className="text-xl font-bold text-white">{t('exercises.mahamrityunjaya.title')}</h2>
            <p className="text-base text-gray-400 my-3">
              {t('exercises.mahamrityunjaya.description')}
            </p>
            <button
              onClick={handleclickex3}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              {t('exercises.mahamrityunjaya.button')}
            </button>
          </div>
        </div>

        {/* Coming Soon Card */}
       <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm">
  <div className="w-full h-32 bg-gray-600 flex items-center justify-center">
    <span className="text-2xl font-bold text-white">{t('exercises.comingSoon.title')}</span>
  </div>
  <div className="p-5 flex flex-col items-center justify-center text-center h-40">
    <h2 className="text-xl font-bold text-white"></h2>
    <p className="text-base text-gray-400">
      {t('exercises.comingSoon.description')}
    </p>
  </div>
</div>
      </div>
    </div>
  );
};

export default ExerciseCards;