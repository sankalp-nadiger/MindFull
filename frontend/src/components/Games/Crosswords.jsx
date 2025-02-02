// src/App.js
import React, { useState } from 'react';


const App = () => {
  const [grid, setGrid] = useState([
    ['H', 'A', 'P', 'P', 'Y'],
    ['E', '', '', '', 'S'],
    ['L', '', '', '', 'E'],
    ['F', '', '', '', 'L'],
    ['F', '', '', '', 'O'],
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [words, setWords] = useState([
    { direction: 'across', start: [0, 0], word: 'HAPPY' },
    { direction: 'down', start: [0, 0], word: 'HEALTH' },
    { direction: 'across', start: [1, 4], word: 'SELFLOVE' },
    { direction: 'down', start: [1, 4], word: 'STRESS' },
  ]);

  const handleCellClick = (rowIndex, colIndex) => {
    setSelectedCell({ rowIndex, colIndex });
    setCurrentInput(grid[rowIndex][colIndex]);
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value.toUpperCase());
    if (selectedCell) {
      const newGrid = grid.map((row, rIndex) =>
        row.map((cell, cIndex) =>
          rIndex === selectedCell.rowIndex && cIndex === selectedCell.colIndex ? e.target.value.toUpperCase() : cell
        )
      );
      setGrid(newGrid);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedCell) {
        const { rowIndex, colIndex } = selectedCell;
        if (colIndex + 1 < grid[rowIndex].length) {
          setSelectedCell({ rowIndex, colIndex: colIndex + 1 });
        } else if (rowIndex + 1 < grid.length) {
          setSelectedCell({ rowIndex: rowIndex + 1, colIndex: 0 });
        }
      }
    }
  };

  const isCorrect = () => {
    return words.every(({ direction, start, word }) => {
      let correct = true;
      if (direction === 'across') {
        for (let i = 0; i < word.length; i++) {
          if (grid[start[0]][start[1] + i] !== word[i]) {
            correct = false;
            break;
          }
        }
      } else if (direction === 'down') {
        for (let i = 0; i < word.length; i++) {
          if (grid[start[0] + i][start[1]] !== word[i]) {
            correct = false;
            break;
          }
        }
      }
      return correct;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Mental Wellness Crossword</h1>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`w-10 h-10 border border-gray-400 text-center leading-10 cursor-pointer ${selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex ? 'bg-blue-200' : ''}`}
                >
                  {cell !== '' ? cell : '\u00A0'}
                </div>
              ))}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="mt-4 p-2 border border-gray-400 rounded w-40 block mx-auto"
          maxLength={1}
        />
        {isCorrect() && (
          <p className="text-green-500 text-xl mt-4 text-center">Congratulations! You've solved the crossword!</p>
        )}
      </div>
    </div>
  );
};

export default App;