import React, { useState, useEffect } from 'react';
import { Moon, Wind, Timer, Heart } from 'lucide-react';

function Breathingexercise() {
  const [isHolding, setIsHolding] = useState(false);
  const [time, setTime] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let interval;
    
    if (isHolding) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 100);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimals}s`;
  };

  const handleStartStop = () => {
    if (!isHolding) {
      setTime(0);
      setShowResults(false);
      setIsHolding(true);
    } else {
      setIsHolding(false);
      const seconds = time / 1000;
      
      if (seconds >= 30) {
        setFeedback('Excellent lung health! Your breath control is impressive.');
      } else if (seconds >= 10) {
        setFeedback('Good lung health. Regular practice can help improve further.');
      } else {
        setFeedback('Average performance. Keep practicing to enhance your lung capacity.');
      }
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-b from-black via-indigo-700 to-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-purple-400" />
            <h1 className="text-5xl font-bold">Soulful Breathing</h1>
          </div>
          <p className="text-2xl text-gray-400">Enhance your mental well-being through controlled breathing</p>
        </header>

        <main className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Wind className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Breath Holding Exercise</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              This exercise helps improve lung capacity and reduces stress. Take a deep breath, 
              click the button, and hold your breath as long as comfortable. Aim for 1 minute 
              for optimal benefits.
            </p>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Timer className="w-6 h-6 text-green-400" />
                <span className="text-4xl font-mono">{formatTime(time)}</span>
              </div>
              
              <button
                onClick={handleStartStop}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  isHolding
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isHolding ? 'Release Breath' : 'Hold Breath'}
              </button>
            </div>

            {showResults && (
              <div className="bg-gray-700 rounded-lg p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-pink-400" />
                  <h3 className="text-lg font-semibold">Your Results</h3>
                </div>
                <p className="text-gray-300 mb-4">{feedback}</p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2">
                    Regular breath-holding exercises can:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Increase lung capacity</li>
                    <li>Reduce stress and anxiety</li>
                    <li>Improve focus and concentration</li>
                    <li>Enhance overall well-being</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Breathingexercise;
