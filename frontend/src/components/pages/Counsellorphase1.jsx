import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    <div className="container my-5">
      <h2 className="text-center mb-4">Counselor Onboarding</h2>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={details.specialization}
              onChange={handleInputChange}
              className="form-control"
              placeholder="E.g., Mental Health, Career Guidance"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">Upload Certificates</label>
            <input
              type="file"
              name="certificates"
              onChange={handleInputChange}
              className="form-control"
              accept=".pdf,.jpg,.png"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={details.experience}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter your years of experience"
              min="0"
              required
            />
          </div>
        </div>

        <div className="card mb-4 p-4 shadow-sm">
          <div className="form-group">
            <label className="mb-2">Additional Information</label>
            <textarea
              name="additionalInfo"
              value={details.additionalInfo}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Share any additional details about yourself"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary px-4 py-2">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CounselorOnboarding;
