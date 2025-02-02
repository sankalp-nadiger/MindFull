// SudokuGame.js

import React, { useState, useEffect } from "react";

const generateSudokuBoard = () => {
  // A simple example of a solved Sudoku grid, the puzzle will be generated from this
  return [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
};

const checkSolution = (board) => {
  // Simple check if Sudoku is solved correctly (you can add more complex checking logic here)
  const isValid = board.every((row) => row.every((cell) => cell !== 0));
  return isValid;
};

function  SudokuGame ()  {
  const [board, setBoard] = useState(generateSudokuBoard());
  const [userBoard, setUserBoard] = useState([...board].map(row => [...row]));
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [score, setScore] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Start the timer when the game is started
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  const handleInputChange = (row, col, value) => {
    if (isGameOver) return;

    const newBoard = [...userBoard];
    newBoard[row][col] = parseInt(value) || 0; // Allowing empty fields (0)

    setUserBoard(newBoard);
  };

  const handleSubmit = () => {
    if (checkSolution(userBoard)) {
      setEndTime(Date.now());
      const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time in seconds
      const score = Math.max(100 - timeTaken, 0); // Simple score based on time taken (you can improve this)
      setScore(score);
      setIsGameOver(true);
    } else {
      alert("Incorrect solution, try again!");
    }
  };

  const renderBoard = () => {
    return (
      <div className="grid grid-cols-9 gap-1">
        {userBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="number"
              min="1"
              max="9"
              value={cell === 0 ? "" : cell}
              onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
              className="w-12 h-12 text-center bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none"
              disabled={board[rowIndex][colIndex] !== 0}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Sudoku - Mental Wellness Game</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
        {renderBoard()}
      </div>
      {!isGameOver && (
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Check Solution
        </button>
      )}
      {isGameOver && (
        <div className="mt-6">
          <p className="text-xl">Congratulations!</p>
          <p className="text-lg">Your score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default SudokuGame;
