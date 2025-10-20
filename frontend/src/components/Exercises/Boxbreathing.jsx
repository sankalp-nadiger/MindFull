import React, { useState, useEffect, useRef, } from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import Particles from './Particlesbg';
const BoxBreathing = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold1, exhale, hold2
  const [cycle, setCycle] = useState(0);
  const [totalCycles] = useState(4);
  const [progress, setProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionData, setSessionData] = useState({ completedCycles: 0, totalTime: 0 });
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const sessionStartRef = useRef(null);

  const phaseDuration = 4000; // 4 seconds per phase
  const boxSize = 240;
  
  const phases = [
    { name: 'inhale', instruction: 'Breathe In', color: 'from-cyan-400 to-blue-500', strokeColor: '#06b6d4' },
    { name: 'hold1', instruction: 'Hold', color: 'from-amber-400 to-orange-500', strokeColor: '#f59e0b' },
    { name: 'exhale', instruction: 'Breathe Out', color: 'from-emerald-400 to-green-500', strokeColor: '#10b981' },
    { name: 'hold2', instruction: 'Hold', color: 'from-purple-400 to-violet-500', strokeColor: '#8b5cf6' }
  ];

  const getPointerPosition = () => {
    const phaseIndex = phases.findIndex(p => p.name === phase);
    const basePositions = [
      { x: 0, y: 0 }, // inhale - top edge
      { x: boxSize, y: 0 }, // hold1 - top right
      { x: boxSize, y: boxSize }, // exhale - right edge
      { x: 0, y: boxSize } // hold2 - bottom left
    ];
    
    if (phaseIndex === -1) return { x: 0, y: 0 };
    
    const currentPos = basePositions[phaseIndex];
    const nextPos = basePositions[(phaseIndex + 1) % 4];
    
    const progressRatio = progress / 100;
    
    return {
      x: currentPos.x + (nextPos.x - currentPos.x) * progressRatio,
      y: currentPos.y + (nextPos.y - currentPos.y) * progressRatio
    };
  };

  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    setCycle(0);
    setProgress(0);
    setShowFeedback(false);
    startTimeRef.current = Date.now();
    sessionStartRef.current = Date.now();
    
    let currentPhaseIndex = 0;
    let currentCycle = 0;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const totalPhaseTime = phaseDuration;
      const currentPhaseProgress = (elapsed % totalPhaseTime) / totalPhaseTime * 100;
      
      setProgress(currentPhaseProgress);
      
      if (elapsed >= totalPhaseTime) {
        startTimeRef.current = Date.now();
        currentPhaseIndex = (currentPhaseIndex + 1) % 4;
        
        if (currentPhaseIndex === 0) {
          currentCycle++;
          setCycle(currentCycle);
        }
        
        if (currentCycle >= totalCycles) {
          stopBreathing();
          return;
        }
        
        setPhase(phases[currentPhaseIndex].name);
        setProgress(0);
      }
    }, 50);
  };

  const stopBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Calculate session data
    const totalSessionTime = sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
    const completedCycles = cycle;
    
    setSessionData({
      completedCycles: completedCycles,
      totalTime: Math.round(totalSessionTime / 1000)
    });
    
    setIsActive(false);
    setPhase('ready');
    setProgress(0);
    setShowFeedback(true);
  };

  const resetExercise = () => {
    setShowFeedback(false);
    setCycle(0);
    setProgress(0);
    setPhase('ready');
    setSessionData({ completedCycles: 0, totalTime: 0 });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentPhaseData = phases.find(p => p.name === phase) || phases[0];
  const pointerPos = getPointerPosition();
  
  const getFeedbackMessage = (cycles) => {
    const messages = {
      0: [
        "Every journey begins with a single step.",
        "Even starting the practice is a victory in itself.",
        "You can try again whenever you're ready."
      ],
      1: [
        "Great start! You've completed your first breathing cycle.",
        "Even one cycle can help center your mind and reduce immediate stress.",
        "This is the foundation of mindful breathing practice.",
        "Building this habit one breath at a time."
      ],
      2: [
        "Excellent! Two cycles show you're building consistency.",
        "Your nervous system is starting to shift into relaxation mode.",
        "You're developing better awareness of your breathing patterns.",
        "Keep practicing to strengthen this healthy habit."
      ],
      3: [
        "Wonderful progress! Three cycles demonstrate real commitment.",
        "You're developing better control over your stress response.",
        "This level of practice can significantly impact your daily well-being.",
        "Your body is learning to access calm more easily."
      ],
      4: [
        "Outstanding! You've completed a full breathing session.",
        "Four cycles activate your parasympathetic nervous system effectively.",
        "You're building a valuable skill for managing stress and anxiety.",
        "This consistent practice will serve you well in challenging moments.",
        "Your mind-body connection is strengthening with each session."
      ]
    };
    
    return messages[cycles] || messages[0];
  };

  const getEncouragementTitle = (cycles) => {
    const titles = {
      0: "Good Try!",
      1: "Good Beginning!",
      2: "Building Momentum!",
      3: "Strong Progress!",
      4: "Excellent Work!"
    };
    return titles[cycles] || "Well Done!";
  };

  return (
    <>
    <div className="relative w-full h-auto min-h-screen bg-black overflow-hidden">
       <div className='absolute' style={{ width: '100%', height: '100%' }}>
  <Particles
    particleColors={['#ffffff', '#ffffff']}
    particleCount={500}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
</div>
    <div className=" relative z-50 font-poppins flex items-center justify-center p-6">
     <Link
            to="/mainpage"
            className="fixed top-2  sm:left-4 left-2 z-50 px-4 py-2  text-white font-semibold rounded-xl  text-sm sm:text-base"
          >
            <ArrowLeft className="inline-block w-4 h-4 mr-1 hover:scale-125 " />
          </Link>
      <div className="max-w-lg w-full">
         <motion.header
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  <div className="flex items-center justify-center gap-1 mb-2">
          
                    <h1 className="text-4xl pb-3 md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-indigo-400">
                      Box Breathing
                    </h1>
                  </div>
                  <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                    4-4-4-4 Breathing Technique for Calm and Focus
                  </p>
                </motion.header>

        {!showFeedback ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="flex flex-col items-center">
              {/* Breathing Box */}
              <div className="relative mb-8 p-6 rounded-2xl bg-slate-900/30 backdrop-blur-sm border border-slate-600/30" 
                   style={{ width: boxSize + 80, height: boxSize + 80 }}>
                <svg width={boxSize + 40} height={boxSize + 40} className="absolute inset-0 m-5">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                 
                  <rect
                    x="20"
                    y="20"
                    width={boxSize}
                    height={boxSize}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.4)"
                    strokeWidth="2"
                    rx="12"
                    filter="url(#glow)"
                  />
                  
                  
                  {isActive && (
                    <>
                     
                      <line
                        x1="20"
                        y1="20"
                        x2={phase === 'inhale' ? 20 + (progress / 100) * boxSize : boxSize + 20}
                        y2="20"
                        stroke={phase === 'inhale' ? currentPhaseData.strokeColor : 'rgba(148, 163, 184, 0.6)'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      
                     
                      {(phase === 'hold1' || phases.findIndex(p => p.name === phase) > 0) && (
                        <line
                          x1={boxSize + 20}
                          y1="20"
                          x2={boxSize + 20}
                          y2={phase === 'hold1' ? 20 + (progress / 100) * boxSize : boxSize + 20}
                          stroke={phase === 'hold1' ? currentPhaseData.strokeColor : 'rgba(148, 163, 184, 0.6)'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                      )}
                      
                     
                      {(phase === 'exhale' || phases.findIndex(p => p.name === phase) > 1) && (
                        <line
                          x1={boxSize + 20}
                          y1={boxSize + 20}
                          x2={phase === 'exhale' ? (boxSize + 20) - (progress / 100) * boxSize : 20}
                          y2={boxSize + 20}
                          stroke={phase === 'exhale' ? currentPhaseData.strokeColor : 'rgba(148, 163, 184, 0.6)'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                      )}
                      
                     
                      {(phase === 'hold2' || phases.findIndex(p => p.name === phase) > 2) && (
                        <line
                          x1="20"
                          y1={boxSize + 20}
                          x2="20"
                          y2={phase === 'hold2' ? (boxSize + 20) - (progress / 100) * boxSize : 20}
                          stroke={phase === 'hold2' ? currentPhaseData.strokeColor : 'rgba(148, 163, 184, 0.6)'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                      )}
                    </>
                  )}
                  
                  
                  <circle
                    cx={pointerPos.x + 20}
                    cy={pointerPos.y + 20}
                    r="12"
                    fill={isActive ? currentPhaseData.strokeColor : '#e2e8f0'}
                    stroke="white"
                    strokeWidth="3"
                    filter="url(#glow)"
                    className={isActive ? "animate-pulse" : ""}
                  />
                </svg>
              </div>

             
              <div className="text-center mb-8">
                {isActive ? (
                  <>
                    <div className={`text-3xl font-bold mb-3 bg-gradient-to-r ${currentPhaseData.color} bg-clip-text text-transparent`}>
                      {currentPhaseData.instruction}
                    </div>
                    <div className="text-slate-300 text-lg mb-2">
                      Cycle {cycle + 1} of {totalCycles}
                    </div>
                    <div className="text-slate-400 bg-slate-700/30 rounded-lg px-4 py-2 inline-block backdrop-blur-sm border border-slate-600/30">
                      {Math.ceil((phaseDuration - (progress / 100 * phaseDuration)) / 1000)}s remaining
                    </div>
                  </>
                ) : (
                  <div className="text-slate-200 text-xl font-medium">
                    Ready to begin your mindful breathing journey
                  </div>
                )}
              </div>

            
              <div className="flex gap-4">
                {!isActive ? (
                  <button
                    onClick={startBreathing}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    Begin Breathing
                  </button>
                ) : (
                  <button
                    onClick={stopBreathing}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
                  >
                    Stop Session
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50 text-center">
            <div className="text-green-400 text-6xl mb-6 animate-bounce">✓</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6">
              {getEncouragementTitle(sessionData.completedCycles)}
            </h2>
            <div className="space-y-4 mb-8">
              {getFeedbackMessage(sessionData.completedCycles).map((message, index) => (
                <p key={index} className="text-slate-300 text-lg leading-relaxed">
                  {message}
                </p>
              ))}
            </div>
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-6 mb-8 backdrop-blur-sm border border-slate-600/30">
              <h3 className="text-white font-semibold text-xl mb-3">Session Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{sessionData.completedCycles}</p>
                  <p className="text-slate-300 text-sm">Cycles Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{sessionData.totalTime}s</p>
                  <p className="text-slate-300 text-sm">Total Duration</p>
                </div>
              </div>
            </div>
            <button
              onClick={resetExercise}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            >
              Practice Again
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default BoxBreathing;