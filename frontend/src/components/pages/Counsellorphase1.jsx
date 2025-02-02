import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const CounselorOnboarding = () => {
  const [details, setDetails] = useState({
    name: '',
    specialization: '',
    certificates: null,
    experience: '',
    additionalInfo: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setDetails({
      ...details,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Counselor Details:', details);
    // Handle file upload and form submission logic here
    navigate('/dashboard'); // Navigate to the dashboard or next page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-b from-black via-blue-950 to-black text-white px-4 py-10">
    <h2 className="text-3xl font-semibold text-green-500 text-center mb-4">
      Counsellor Onboarding
    </h2>
    <form onSubmit={handleSubmit}>
      <div className="card mb-4 p-4 shadow-sm bg-gray-800 rounded-lg">
        <div className="form-group">
          <label className="mb-2 text-gray-300">Full Name</label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>
  
      <div className="card mb-4 p-4 shadow-sm bg-gray-800 rounded-lg">
        <div className="form-group">
          <label className="mb-2 text-gray-300">Specialization</label>
          <input
            type="text"
            name="specialization"
            value={details.specialization}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            placeholder="E.g., Mental Health, Career Guidance"
            required
          />
        </div>
      </div>
  
      <div className="card mb-4 p-4 shadow-sm bg-gray-800 rounded-lg">
        <div className="form-group">
          <label className="mb-2 text-gray-300">Upload Certificates</label>
          <input
            type="file"
            name="certificates"
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            accept=".pdf,.jpg,.png"
            required
          />
        </div>
      </div>
  
      <div className="card mb-4 p-4 shadow-sm bg-gray-800 rounded-lg">
        <div className="form-group">
          <label className="mb-2 text-gray-300">Years of Experience</label>
          <input
            type="number"
            name="experience"
            value={details.experience}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            placeholder="Enter your years of experience"
            min="0"
            required
          />
        </div>
      </div>
  
      <div className="card mb-4 p-4 shadow-sm bg-gray-800 rounded-lg">
        <div className="form-group">
          <label className="mb-2 text-gray-300">Additional Information</label>
          <textarea
            name="additionalInfo"
            value={details.additionalInfo}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            placeholder="Share any additional details about yourself"
            rows="3"
          ></textarea>
        </div>
      </div>
  
      <div className="text-center mt-6">
        <button
          type="submit"
          className="w-full max-w-lg py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-600"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
  
  );
};

export default CounselorOnboarding;
