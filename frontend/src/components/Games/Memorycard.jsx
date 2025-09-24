import React, { useState, useEffect } from 'react';
import { Trophy, Clock, RotateCcw, Star, Eye, EyeOff } from 'lucide-react';

const MemoryCardGame = () => {
  const [gameLevel, setGameLevel] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Game configurations
  const gameConfigs = {
    easy: { size: 5, time: 180, name: 'Easy (5×5)' }, // 3 minutes
    medium: { size: 8, time: 300, name: 'Medium (8×8)' }, // 5 minutes
    hard: { size: 10, time: 600, name: 'Hard (10×10)' } // 10 minutes
  };

  // Symbols for cards (using Unicode symbols for better compatibility)
  const symbols = [
    '🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎫', '🎬',
    '🎤', '🎧', '🎼', '🎹', '🎸', '🥁', '🎺', '🎻',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
    '🌟', '⭐', '✨', '🌈', '🌙', '☀️', '🌊', '🔥',
    '💎', '💍', '👑', '🏆', '🎖️', '🏅', '🎗️', '🎀'
  ];

  // Initialize game based on level
  const initializeGame = (level) => {
    const config = gameConfigs[level];
    const totalCards = config.size * config.size;
    const pairs = totalCards / 2;
    
    // Create pairs of cards
    const selectedSymbols = symbols.slice(0, pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle cards
    const shuffledCards = cardPairs
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setGameLevel(level);
    setTimeLeft(config.time);
    setScore(0);
    setMoves(0);
    setMatchedCards([]);
    setFlippedCards([]);
    setGameStarted(false);
    setGameEnded(false);
    setShowAllCards(true);
    setScoreSubmitted(false);

    // Show all cards for 3 seconds, then hide them and start game
    setTimeout(() => {
      setShowAllCards(false);
      setGameStarted(true);
    }, 3000);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !gameEnded && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameEnded(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timeLeft]);

  // Check for game completion
  useEffect(() => {
    if (gameStarted && matchedCards.length === cards.length && cards.length > 0) {
      setGameEnded(true);
    }
  }, [matchedCards.length, cards.length, gameStarted]);

  // Submit score when game ends
  useEffect(() => {
    if (gameEnded && !scoreSubmitted && !isSubmittingScore && gameLevel) {
      submitScore();
    }
  }, [gameEnded, scoreSubmitted, isSubmittingScore, gameLevel]);

  // Handle card click
  const handleCardClick = (cardId) => {
    if (!gameStarted || gameEnded || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (card.isMatched || flippedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setScore(score + 1);
        setMatchedCards([...matchedCards, firstId, secondId]);
        setFlippedCards([]);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Submit score to backend
  const submitScore = async () => {
    console.log('🎮 Attempting to submit memory game score');
    setIsSubmittingScore(true);
    
    try {
      const token = sessionStorage.getItem('accessToken');
      
      if (!token) {
        console.error('❌ No token found');
        setIsSubmittingScore(false);
        return;
      }

      const config = gameConfigs[gameLevel];
      const totalPairs = (config.size * config.size) / 2;
      const timeBonus = Math.max(0, Math.floor(timeLeft / 10)); // Bonus points for remaining time
      const finalScore = score + timeBonus;

      const payload = {
        gameName: `Memory Game - ${config.name}`,
        score: finalScore,
        totalQuestions: totalPairs // Using totalPairs as "total possible score"
      };
      
      console.log('📤 Sending memory game payload:', payload);
      
      const response = await fetch('http://localhost:8000/api/scores/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Memory game score submitted:', data);
      setScoreSubmitted(true);
      
    } catch (error) {
      console.error('❌ Error submitting memory game score:', error.message);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset game
  const resetGame = () => {
    setGameLevel(null);
    setCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(0);
    setGameStarted(false);
    setGameEnded(false);
    setShowAllCards(false);
    setScoreSubmitted(false);
  };

  // Level selection screen
  if (!gameLevel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.05] pointer-events-none z-20"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Memory Card Game</h1>
            <p className="text-gray-400">Choose your difficulty level</p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(gameConfigs).map(([level, config]) => (
              <button
                key={level}
                onClick={() => initializeGame(level)}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-semibold capitalize text-lg">{config.name}</div>
                  <div className="text-sm text-gray-400">
                    {config.size * config.size} cards • {formatTime(config.time)} time limit
                  </div>
                </div>
                <Star className="w-6 h-6 text-yellow-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const config = gameConfigs[gameLevel];
  const gridCols = {
    5: 'grid-cols-5',
    8: 'grid-cols-8',
    10: 'grid-cols-10'
  }[config.size];

  const cardSize = {
    5: 'w-16 h-16 text-2xl',
    8: 'w-12 h-12 text-lg',
    10: 'w-10 h-10 text-sm'
  }[config.size];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.05] pointer-events-none z-20"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Memory Game - {config.name}</h1>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>
          </div>
          
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{score}</div>
              <div className="text-sm text-gray-400">Matches</div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{moves}</div>
              <div className="text-sm text-gray-400">Moves</div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-400">Time Left</div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((matchedCards.length / cards.length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Complete</div>
            </div>
          </div>
        </div>

        {/* Game Status Messages */}
        {showAllCards && (
          <div className="bg-blue-800 p-4 rounded-lg mb-6 text-center">
            <Eye className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold">Memorize the cards! Game starts in a few seconds...</p>
          </div>
        )}

        {gameEnded && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center shadow-xl">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {matchedCards.length === cards.length ? 'Congratulations! 🎉' : 'Time\'s Up! ⏰'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-blue-400">{score}</div>
                <div className="text-sm text-gray-400">Matches Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{moves}</div>
                <div className="text-sm text-gray-400">Total Moves</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.max(0, Math.floor(timeLeft / 10))}
                </div>
                <div className="text-sm text-gray-400">Time Bonus</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {score + Math.max(0, Math.floor(timeLeft / 10))}
                </div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
            </div>

            {isSubmittingScore && (
              <p className="text-blue-400 mb-4 flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></span>
                Saving your score...
              </p>
            )}
            {scoreSubmitted && (
              <p className="text-green-400 mb-4">✅ Score saved successfully!</p>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors font-semibold"
              >
                Play Again
              </button>
              <button
                onClick={() => window.location.href = '/scoreboard'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
              >
                View Scoreboard
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
          <div className={`grid ${gridCols} gap-2 justify-center`}>
            {cards.map((card) => {
              const isFlipped = flippedCards.includes(card.id) || 
                              matchedCards.includes(card.id) || 
                              showAllCards;
              
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={!gameStarted || gameEnded || showAllCards}
                  className={`
                    ${cardSize} 
                    rounded-lg font-bold transition-all duration-300 transform
                    ${isFlipped 
                      ? matchedCards.includes(card.id)
                        ? 'bg-green-600 text-white scale-105'
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-transparent hover:scale-105'
                    }
                    ${!gameStarted && !showAllCards ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  {isFlipped ? card.symbol : '?'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        {gameStarted && !gameEnded && (
          <div className="bg-gray-800 p-4 rounded-lg mt-6 text-center text-gray-400">
            <EyeOff className="w-5 h-5 inline mr-2" />
            Click two cards to find matching pairs. Complete all pairs before time runs out!
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCardGame;