import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sample API URL for Open Trivia Database
const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple&category=21"; // Category 21 = General Knowledge

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BASE_URL;
  // Function to submit score to backend
  const submitScore = async (finalScore, totalQuestions, gameName = "Quiz Game") => {
    console.log('🎮 Attempting to submit score:', { finalScore, totalQuestions, gameName });
    setIsSubmittingScore(true);
    
    try {
      const token = sessionStorage.getItem('accessToken');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token?.substring(0, 20) + '...');
      
      if (!token) {
        console.error('❌ No token found');
        alert('Please log in to save your score');
        setIsSubmittingScore(false);
        return;
      }
      
      const payload = {
        gameName,
        score: finalScore,
        totalQuestions
      };
      console.log('📤 Sending payload:', payload);
      
      const response = await axios.post(`${BACKEND_URL}/api/scores/add`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Score submission response status:', response.status);
      console.log('✅ Score submission response data:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        setScoreSubmitted(true);
        console.log('🎉 Score saved successfully!');
      } else {
        console.error('❌ Unexpected response status:', response.status);
      }
      
    } catch (error) {
      console.error('❌ Error submitting score:');
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Show user-friendly error
      if (error.response?.status === 401) {
        alert('Your session expired. Please log in again.');
      } else if (error.response?.status === 400) {
        alert('Invalid score data. Please try again.');
      } else {
        alert('Failed to save score. Please check your connection.');
      }
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Auto-submit score when game ends
  useEffect(() => {
    console.log('🎯 useEffect triggered - gameEnded:', gameEnded, 'scoreSubmitted:', scoreSubmitted, 'isSubmittingScore:', isSubmittingScore);
    console.log('🎯 Current score:', score, 'Total questions:', questions.length);
    
    if (gameEnded && !scoreSubmitted && !isSubmittingScore && questions.length > 0) {
      console.log('🚀 Calling submitScore...');
      submitScore(score, questions.length);
    }
  }, [gameEnded, score, questions.length, scoreSubmitted, isSubmittingScore]);

  // Fetch questions from API when the component mounts
  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        const fetchedQuestions = response.data.results.map((questionData) => {
          // Shuffling the answers to randomize order
          const options = [
            ...questionData.incorrect_answers,
            questionData.correct_answer
          ];
          return {
            question: questionData.question,
            options: options.sort(() => Math.random() - 0.5),
            answer: questionData.correct_answer,
          };
        });
        setQuestions(fetchedQuestions);
        console.log('📝 Questions loaded:', fetchedQuestions.length);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  useEffect(() => {
    setSelectedOption(""); 
    setAnswered(false);
  }, [currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === questions[currentQuestionIndex].answer;
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      console.log('✅ Correct answer! New score:', newScore);
    } else {
      console.log('❌ Wrong answer. Score remains:', score);
    }
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswered(false);
    } else {
   
      console.log('🏁 Game ended! Final score:', score, '/', questions.length);
      setGameEnded(true);
    }
  };

  const handleRestart = () => {
    console.log('🔄 Restarting game...');
    setGameEnded(false);
    setScoreSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setAnswered(false);
    setSelectedOption("");
    

    axios.get(API_URL)
      .then((response) => {
        const fetchedQuestions = response.data.results.map((questionData) => {
          const options = [
            ...questionData.incorrect_answers,
            questionData.correct_answer
          ];
          return {
            question: questionData.question,
            options: options.sort(() => Math.random() - 0.5),
            answer: questionData.correct_answer,
          };
        });
        setQuestions(fetchedQuestions);
        console.log('🔄 New questions loaded:', fetchedQuestions.length);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  };

  // Add manual submit button for testing
  const handleManualSubmit = () => {
    console.log('🧪 Manual submit triggered');
    submitScore(score, questions.length, "Manual Test Game");
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white p-4">
        <div className="text-center text-2xl">Loading questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white p-4">
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.05] pointer-events-none z-20"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-6">Mental Wellness Quiz</h1>
        
        {!gameEnded ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <span className="text-lg">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="text-sm text-gray-400 mt-1">Current Score: {score}</div>
            </div>
            <p className="text-xl" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></p>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full py-3 text-lg bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none ${selectedOption === option ? 'bg-green-600' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={answered}
                  dangerouslySetInnerHTML={{ __html: option }}
                />
              ))}
            </div>
            {!answered ? (
              <button
                className={`mt-6 w-full py-3 text-lg bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50`}
                onClick={handleNext}
                disabled={!selectedOption}
              >
                Submit Answer
              </button>
            ) : (
              <div className="mt-6 flex flex-col items-center">
                <div className="text-center mb-4">
                  <p className={`text-lg ${selectedOption === questions[currentQuestionIndex].answer ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedOption === questions[currentQuestionIndex].answer ? '✅ Correct!' : '❌ Wrong'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Correct answer: <span dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].answer }}></span>
                  </p>
                </div>
                <button
                  className="w-full py-3 text-lg bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-semibold mb-4">Your Score: {score}/{questions.length}</p>
            <p className="text-lg mb-6">You got {Math.round((score / questions.length) * 100)}% correct!</p>
            
            {/* Show submission status */}
            {isSubmittingScore && (
              <p className="text-blue-600 mb-2 flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                Saving your score...
              </p>
            )}
            {scoreSubmitted && (
              <p className="text-green-600 mb-2">✅ Score saved successfully!</p>
            )}
            
            <div className="space-y-2">
              {/* Add manual submit button for testing */}
              <button
                className="w-full py-2 text-sm bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
                onClick={handleManualSubmit}
                disabled={isSubmittingScore}
              >
                🧪 Manual Submit (Test)
              </button>
              
              <button
                className="w-full py-3 text-lg bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                onClick={handleRestart}
                disabled={isSubmittingScore}
              >
                {isSubmittingScore ? 'Saving...' : 'Play Again'}
              </button>
              
              <button
                className="w-full py-3 text-lg bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                onClick={() => {
                  window.location.href = '/scoreboard';
                }}
              >
                View Scoreboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;