import React, { useState } from "react";
//import "./CounselorSignUp.css"; // Dark background styling

const CounselorSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Counselor Sign-up successful!");
    // Handle sign-up logic here
  };

  return (
    <div className="container">
      <h1>Counselor Sign Up</h1>
      <div className="gif-container">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="welcome-gif"
        />
      </div>
      <form onSubmit={handleSubmit}>
        
      <div className="form-group">
          <label htmlFor="phone">phone</label>
          <input
            type="tel"
            id="phone"
            className="form-control"
            placeholder="Enter your phone number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit-button" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default CounselorSignUp;
