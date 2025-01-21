import React, { useState } from 'react';

const Crossword = () => {
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
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow-lg w-75">
        <div className="card-body">
          <h1 className="text-center mb-4">Mental Wellness Crossword</h1>
          <div className="grid mb-4">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="d-flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`border text-center d-flex align-items-center justify-content-center w-10 h-10 ${
                      selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex ? 'bg-primary text-white' : 'bg-light'
                    }`}
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
            className="form-control w-25 mx-auto mb-4"
            maxLength={1}
          />
          {isCorrect() && (
            <p className="text-success text-center">Congratulations! You've solved the crossword!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crossword;
