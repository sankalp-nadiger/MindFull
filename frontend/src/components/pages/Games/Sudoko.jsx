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

function SudokuGame() {
  const [board, setBoard] = useState(generateSudokuBoard());
  const [userBoard, setUserBoard] = useState([...board].map((row) => [...row]));
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
      <div className="row g-2 justify-content-center">
        {userBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="col-1">
              <input
                type="number"
                min="1"
                max="9"
                value={cell === 0 ? "" : cell}
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                className="form-control text-center"
                disabled={board[rowIndex][colIndex] !== 0}
              />
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-light">
      <h1 className="mb-4 text-center">Sudoku - Mental Wellness Game</h1>
      <div className="bg-secondary p-4 rounded shadow-lg mb-4">
        {renderBoard()}
      </div>
      {!isGameOver && (
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-lg mb-4"
        >
          Check Solution
        </button>
      )}
      {isGameOver && (
        <div className="mt-4 text-center">
          <p className="fs-3">Congratulations!</p>
          <p className="fs-5">Your score: {score}</p>
        </div>
      )}
    </div>
  );
}

export default SudokuGame;
