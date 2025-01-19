import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
const OnBoardphase1 = () => {
    const url="localhost:5173/phase2"
  const [answers, setAnswers] = useState({
    mentalWellBeing: '',
    feelOverwhelmed: false,
    sleepWell: '',
    someoneToTalk: false,
    physicalSymptoms: '',
  });
  const navigate=useNavigate();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnswers({
      ...answers,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Answers:', answers);
    navigate('/phase2');
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Let's get to know u better</h2>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">
              On a scale of 1-10, how would you rate your mental well-being today?
            </label>
            <input
              type="number"
              name="mentalWellBeing"
              value={answers.mentalWellBeing}
              onChange={handleInputChange}
              className="form-control"
              min="1"
              max="10"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">
              Do you often feel overwhelmed by stress or responsibilities?
            </label>
            <div className="form-check">
              <input
                type="checkbox"
                name="feelOverwhelmed"
                checked={answers.feelOverwhelmed}
                onChange={handleInputChange}
                className="form-check-input"
              />
              <label className="form-check-label">Yes</label>
            </div>
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">
              Are you able to sleep well and feel rested when you wake up?
            </label>
            <input
              type="text"
              name="sleepWell"
              value={answers.sleepWell}
              onChange={handleInputChange}
              className="form-control"
              placeholder="E.g., Yes, No, Sometimes"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">
              Do you feel like you have someone you can talk to when you're feeling down?
            </label>
            <div className="form-check">
              <input
                type="checkbox"
                name="someoneToTalk"
                checked={answers.someoneToTalk}
                onChange={handleInputChange}
                className="form-check-input"
              />
              <label className="form-check-label">Yes</label>
            </div>
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">
              Have you noticed any physical symptoms (like fatigue, headaches, or muscle tension) related to stress or emotions?
            </label>
            <textarea
              name="physicalSymptoms"
              value={answers.physicalSymptoms}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Describe your symptoms here"
              rows="3"
              required
            ></textarea>
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary px-4 py-2">
           Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnBoardphase1;
