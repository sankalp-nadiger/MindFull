import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

const MahamrityunjayaBreathing = () => {
  const [stage, setStage] = useState('preparation'); // preparation, instructions, breathing, complete
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0); // 0-3 for the 4 phases
  const [cycleCount, setCycleCount] = useState(0);
  const [instructionStep, setInstructionStep] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const phaseIntervalRef = useRef(null);

  const mantraParts = [
    "Om Tryambakam Yajamahe",
    "Sugandhim Pushtivardhanam", 
    "Urvaarukamiva Bandhanaan",
    "Mrityor Mukshiya Maamritaat"
  ];

  const breathingInstructions = [
    "Inhale",
    "Exhale", 
    "Inhale",
    "Exhale"
  ];

  const preparationSteps = [
    "Find a comfortable seated position",
    "Keep your spine straight and shoulders relaxed",
    "Close your eyes gently for deeper focus",
    "Take a few slow, deep breaths to settle your mind",
    "When ready, click START to begin the exercise"
  ];

  useEffect(() => {
    // Initialize audio element with placeholder for Mahamrityunjaya mantra
    // Replace 'path/to/your/mahamrityunjaya-mantra.mp3' with your actual audio file path
    const audio = new Audio();
    
    // Placeholder for actual mantra audio file
    // audio.src = 'path/to/your/mahamrityunjaya-mantra.mp3';
    // audio.loop = true;
    // audio.preload = 'auto';
    
    // For now, using a placeholder URL - replace with your actual audio file
    // You can use any Mahamrityunjaya mantra audio file from:
    // - Local file: './assets/mahamrityunjaya-mantra.mp3'
    // - Online source: 'https://example.com/mahamrityunjaya-mantra.mp3'
    audio.src = '/Mahamrityunjay.mp3'; // Silent placeholder
    
    audio.volume = isMuted ? 0 : 0.3;
    audio.loop = true;
    
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (stage === 'instructions') {
      const timer = setTimeout(() => {
        if (instructionStep < preparationSteps.length - 1) {
          setInstructionStep(prev => prev + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [instructionStep, stage]);

  useEffect(() => {
    if (stage === 'breathing' && isPlaying) {
      // Each breathing phase lasts 5 seconds
      phaseIntervalRef.current = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev >= 5) {
            setBreathingPhase(prevPhase => {
              const nextPhase = (prevPhase + 1) % 4;
              if (nextPhase === 0) {
                setCycleCount(prev => prev + 1);
              }
              return nextPhase;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
    }

    return () => {
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
    };
  }, [stage, isPlaying]);

  const startExercise = () => {
    if (stage === 'preparation') {
      setStage('instructions');
      setInstructionStep(0);
    } else if (stage === 'instructions') {
      setStage('breathing');
      setIsPlaying(true);
      setBreathingPhase(0);
      setPhaseTimer(0);
      setCycleCount(0);
      if (audioRef.current && !isMuted) {
        audioRef.current.play();
      }
    }
  };

  const pauseResume = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const stopExercise = () => {
    setIsPlaying(false);
    setStage('complete');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
    }
  };

  const resetExercise = () => {
    setStage('preparation');
    setIsPlaying(false);
    setBreathingPhase(0);
    setCycleCount(0);
    setInstructionStep(0);
    setPhaseTimer(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : 0.5;
    }
  };

  const getBreathingCircleSize = () => {
    const progress = phaseTimer / 5;
    const isInhaling = breathingPhase === 0 || breathingPhase === 2;
    
    if (isInhaling) {
      return 150 + (progress * 100); // Expand from 150px to 250px
    } else {
      return 250 - (progress * 100); // Contract from 250px to 150px
    }
  };

  const renderPreparation = () => (
    <div className="text-center space-y-8">
      <h1 className="text-4xl font-bold text-amber-300 mb-8">
        Mahamrityunjaya Mantra
      </h1>
      <h2 className="text-2xl font-semibold text-white mb-6">
        Breathing Exercise
      </h2>
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          This sacred breathing exercise combines the powerful Mahamrityunjaya mantra with mindful breathing. 
          The practice helps promote healing, inner peace, and spiritual growth.
        </p>
        <p className="text-amber-200 text-sm mb-4">
          Recommended: Practice for 11, 27, or 108 cycles (5-15 minutes)
        </p>
      </div>
      
      <button
        onClick={startExercise}
        className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
      >
        Begin Preparation
      </button>
    </div>
  );

  const renderInstructions = () => (
    <div className="text-center space-y-8">
      <h2 className="text-3xl font-bold text-amber-300 mb-8">Preparation</h2>
      
      <div className="bg-gray-800 rounded-lg p-8 max-w-xl mx-auto">
        <div className="text-2xl font-bold text-white mb-6">
          Step {instructionStep + 1} of {preparationSteps.length}
        </div>
        <div className="text-xl text-amber-200 leading-relaxed">
          {preparationSteps[instructionStep]}
        </div>
      </div>

      {instructionStep === preparationSteps.length - 1 && (
        <button
          onClick={startExercise}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors animate-pulse"
        >
          <Play className="inline mr-2" size={24} />
          START EXERCISE
        </button>
      )}
    </div>
  );

  const renderBreathing = () => (
    <div className="text-center space-y-8">
      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={pauseResume}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={stopExercise}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Square size={20} />
        </button>
        <button
          onClick={toggleMute}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Cycle Counter */}
      <div className="text-amber-300 text-xl font-semibold">
        Cycle: {cycleCount + 1}
      </div>

      {/* Breathing Circle */}
      <div className="relative flex justify-center items-center my-12">
        <div 
          className="rounded-full border-4 border-amber-400 transition-all duration-1000 ease-in-out flex items-center justify-center"
          style={{
            width: `${getBreathingCircleSize()}px`,
            height: `${getBreathingCircleSize()}px`,
            backgroundColor: breathingPhase === 0 || breathingPhase === 2 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)'
          }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {breathingInstructions[breathingPhase]}
            </div>
            <div className="text-lg text-gray-300">
              {5 - phaseTimer}s
            </div>
          </div>
        </div>
      </div>

      {/* Mantra Display */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg mx-auto">
        <div className="text-sm text-gray-400 mb-2">
          {breathingPhase === 0 || breathingPhase === 2 ? 'Inhale with:' : 'Exhale with:'}
        </div>
        <div className="text-2xl font-bold text-amber-300">
          {mantraParts[breathingPhase]}
        </div>
      </div>

      {/* Visualization Guide */}
      <div className="bg-gray-700 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-gray-300 text-sm">
          {breathingPhase === 0 || breathingPhase === 2 
            ? "Visualize healing energy flowing through you" 
            : "Feel negativity leaving your body"}
        </p>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-8">
      <h2 className="text-4xl font-bold text-green-400 mb-8">
        🙏 Practice Complete
      </h2>
      
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg mx-auto">
        <div className="text-xl text-white mb-4">
          Congratulations! You completed <span className="text-amber-300 font-bold">{cycleCount}</span> cycles.
        </div>
        
        <div className="text-gray-300 mb-6 space-y-2">
          <p>Take a moment to notice how you feel.</p>
          <p>Allow the peaceful energy to settle within you.</p>
        </div>

        {cycleCount < 11 && (
          <div className="bg-amber-900/30 border border-amber-600 rounded p-4 mb-4">
            <p className="text-amber-200 text-sm">
              For deeper benefits, try practicing 11, 27, or 108 cycles regularly.
            </p>
          </div>
        )}

        {cycleCount >= 11 && cycleCount < 27 && (
          <div className="bg-green-900/30 border border-green-600 rounded p-4 mb-4">
            <p className="text-green-200 text-sm">
              Excellent! You've completed a traditional short practice. Consider working up to 27 or 108 cycles.
            </p>
          </div>
        )}

        {cycleCount >= 27 && cycleCount < 108 && (
          <div className="bg-blue-900/30 border border-blue-600 rounded p-4 mb-4">
            <p className="text-blue-200 text-sm">
              Wonderful! You've completed a medium practice. The ultimate goal is 108 cycles for maximum benefit.
            </p>
          </div>
        )}

        {cycleCount >= 108 && (
          <div className="bg-purple-900/30 border border-purple-600 rounded p-4 mb-4">
            <p className="text-purple-200 text-sm">
              🌟 Exceptional! You've completed the full traditional practice of 108 cycles. This is truly dedicated spiritual practice.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={resetExercise}
        className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
      >
        Practice Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {stage === 'preparation' && renderPreparation()}
        {stage === 'instructions' && renderInstructions()}
        {stage === 'breathing' && renderBreathing()}
        {stage === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default MahamrityunjayaBreathing;