import React, { useState, useEffect } from 'react';
import { Moon, Wind, Timer, Heart,ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion";
import Prism from './Prismbg';
import { Link } from "react-router-dom";

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
    <>

      <div className="bg-black min-h-screen  text-gray-100">
        <div style={{ width: '100%', height: '100%', position: 'absolute', overflowX: 'hidden' }}>
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
        <div className="container font-poppins mx-auto px-4 pt-2 ">
          <Link
            to="/mainpage"
            className="fixed top-2  sm:left-4 left-2 z-50 px-4 py-2  text-white font-semibold rounded-xl  text-sm sm:text-base"
          >
            <ArrowLeft className="inline-block w-4 h-4 mr-1 hover:scale-125 " />
          </Link>
          <motion.header
            className="text-center mb-8"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">

              <h1 className="text-4xl pb-3 md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-indigo-400">
                Soulful Breathing
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Enhance your mental well-being through mindful breathing practices.
            </p>
          </motion.header>


          <main className="max-w-2xl mx-auto">
            <motion.div
              className="rounded-2xl p-8  shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >

              <div className="flex items-center gap-3 ">
                <Wind className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-semibold tracking-wide">
                  Breath Holding Exercise
                </h2>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">
                This exercise helps improve lung capacity and reduces stress. Take
                a deep breath, click the button, and hold your breath as long as
                comfortable. Aim for{" "}
                <span className="font-bold text-indigo-300">1 minute</span> for
                optimal benefits.
              </p>


              <motion.div
                className="text-center mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Timer className="w-7 h-7 text-green-400" />
                  <span className="text-5xl md:text-6xl font-mono font-bold drop-shadow-sm">
                    {formatTime(time)}
                  </span>
                </div>

                <motion.button
                  onClick={handleStartStop}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-8 py-4 rounded-full font-bold tracking-wide transition-all shadow-lg text-lg md:text-xl ${isHolding
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  {isHolding ? "Release Breath" : "Hold Breath"}
                </motion.button>
              </motion.div>


              {showResults && (
                <motion.div
                  className="rounded-xl p-6 bg-indigo-300/50 animate-fade-in"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-pink-600" />
                    <h3 className="text-lg font-semibold">Your Results</h3>
                  </div>
                  <p className="text-white  mb-4 italic font-semibold">{feedback}</p>
                  <div className="text-sm text-blue-950 font-semibold">
                    <p className="mb-2">Regular breath-holding exercises can:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Increase lung capacity</li>
                      <li>Reduce stress and anxiety</li>
                      <li>Improve focus and concentration</li>
                      <li>Enhance overall well-being</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Breathingexercise;
