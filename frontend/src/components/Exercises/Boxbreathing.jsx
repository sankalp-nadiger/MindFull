import React, { useState, useEffect, useRef } from 'react';

const BoxBreathing = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold1, exhale, hold2
  const [cycle, setCycle] = useState(0);
  const [totalCycles] = useState(4);
  const [progress, setProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const phaseDuration = 4000; // 4 seconds per phase
  const boxSize = 200;
  
  const phases = [
    { name: 'inhale', instruction: 'Breathe In', color: 'bg-blue-500' },
    { name: 'hold1', instruction: 'Hold', color: 'bg-yellow-500' },
    { name: 'exhale', instruction: 'Breathe Out', color: 'bg-green-500' },
    { name: 'hold2', instruction: 'Hold', color: 'bg-purple-500' }
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
    setIsActive(false);
    setPhase('ready');
    setProgress(0);
    setShowFeedback(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetExercise = () => {
    setShowFeedback(false);
    setCycle(0);
    setProgress(0);
    setPhase('ready');
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
  
  const feedbackMessages = [
    "Great job! You've completed a full breathing cycle.",
    "Regular practice can help reduce stress and anxiety.",
    "Box breathing activates your parasympathetic nervous system.",
    "Try practicing this technique daily for best results.",
    "You're building a valuable skill for managing stress."
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Box Breathing</h1>
          <p className="text-gray-400">4-4-4-4 breathing technique for relaxation</p>
        </div>

        {!showFeedback ? (
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="flex flex-col items-center">
              {/* Breathing Box */}
              <div className="relative mb-8" style={{ width: boxSize + 40, height: boxSize + 40 }}>
                <svg width={boxSize + 40} height={boxSize + 40} className="absolute inset-0">
                  {/* Box outline */}
                  <rect
                    x="20"
                    y="20"
                    width={boxSize}
                    height={boxSize}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                    rx="8"
                  />
                  
                  {/* Progress path */}
                  {isActive && (
                    <>
                      {/* Top edge - inhale */}
                      <line
                        x1="20"
                        y1="20"
                        x2={phase === 'inhale' ? 20 + (progress / 100) * boxSize : boxSize + 20}
                        y2="20"
                        stroke={phase === 'inhale' ? currentPhaseData.color.replace('bg-', '#') : 'rgba(255, 255, 255, 0.5)'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      
                      {/* Right edge - hold1 */}
                      {(phase === 'hold1' || phases.findIndex(p => p.name === phase) > 0) && (
                        <line
                          x1={boxSize + 20}
                          y1="20"
                          x2={boxSize + 20}
                          y2={phase === 'hold1' ? 20 + (progress / 100) * boxSize : boxSize + 20}
                          stroke={phase === 'hold1' ? currentPhaseData.color.replace('bg-', '#') : 'rgba(255, 255, 255, 0.5)'}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      )}
                      
                      {/* Bottom edge - exhale */}
                      {(phase === 'exhale' || phases.findIndex(p => p.name === phase) > 1) && (
                        <line
                          x1={boxSize + 20}
                          y1={boxSize + 20}
                          x2={phase === 'exhale' ? (boxSize + 20) - (progress / 100) * boxSize : 20}
                          y2={boxSize + 20}
                          stroke={phase === 'exhale' ? currentPhaseData.color.replace('bg-', '#') : 'rgba(255, 255, 255, 0.5)'}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      )}
                      
                      {/* Left edge - hold2 */}
                      {(phase === 'hold2' || phases.findIndex(p => p.name === phase) > 2) && (
                        <line
                          x1="20"
                          y1={boxSize + 20}
                          x2="20"
                          y2={phase === 'hold2' ? (boxSize + 20) - (progress / 100) * boxSize : 20}
                          stroke={phase === 'hold2' ? currentPhaseData.color.replace('bg-', '#') : 'rgba(255, 255, 255, 0.5)'}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      )}
                    </>
                  )}
                  
                  {/* Pointer */}
                  <circle
                    cx={pointerPos.x + 20}
                    cy={pointerPos.y + 20}
                    r="8"
                    fill={isActive ? currentPhaseData.color.replace('bg-', '#') : 'white'}
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Instructions */}
              <div className="text-center mb-6">
                {isActive ? (
                  <>
                    <div className={`text-2xl font-bold mb-2 ${currentPhaseData.color.replace('bg-', 'text-')}`}>
                      {currentPhaseData.instruction}
                    </div>
                    <div className="text-gray-400">
                      Cycle {cycle + 1} of {totalCycles}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {Math.ceil((phaseDuration - (progress / 100 * phaseDuration)) / 1000)}s remaining
                    </div>
                  </>
                ) : (
                  <div className="text-white text-lg">
                    Ready to start your breathing exercise
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                {!isActive ? (
                  <button
                    onClick={startBreathing}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Start Breathing
                  </button>
                ) : (
                  <button
                    onClick={stopBreathing}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-4">Well Done!</h2>
            <div className="space-y-3 mb-6">
              {feedbackMessages.map((message, index) => (
                <p key={index} className="text-gray-300 text-sm">
                  {message}
                </p>
              ))}
            </div>
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">Your Session</h3>
              <p className="text-gray-300 text-sm">Completed {totalCycles} breathing cycles</p>
              <p className="text-gray-400 text-xs mt-1">Total time: ~{totalCycles * 16} seconds</p>
            </div>
            <button
              onClick={resetExercise}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Practice Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxBreathing;