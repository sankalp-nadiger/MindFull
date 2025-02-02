import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sample API URL for Open Trivia Database
const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple&category=21"; // Category 21 = General Knowledge

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answered, setAnswered] = useState(false);

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
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  useEffect(() => {
    setSelectedOption(""); // Reset option on question change
    setAnswered(false);
  }, [currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setAnswered(false);
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
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-6">Mental Wellness Quiz</h1>
        <div className="space-y-6">
          <p className="text-xl">{currentQuestion.question}</p>
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`w-full py-3 text-lg bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none ${selectedOption === option ? 'bg-green-600' : ''}`}
                onClick={() => handleOptionSelect(option)}
                disabled={answered}
              >
                {option}
              </button>
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
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  className="w-full py-3 text-lg bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                  onClick={handleNextQuestion}
                >
                  Next Question
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-semibold mb-4">Your Score: {score}/{questions.length}</p>
                  <button
                    className="w-full py-3 text-lg bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-colors"
                    onClick={handleRestart}
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
