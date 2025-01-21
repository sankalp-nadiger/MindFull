import React, { useState } from "react";
//import "./ParentSignUp.css"; // Dark background styling

const ParentSignUp = () => {
    
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Parent Sign-up successful!");
    // Handle sign-up logic here
  };

  return (
    <div className="container">
      <h1>Parent Sign Up</h1>
      <div className="gif-container">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="welcome-gif"
        />
      </div>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="fullname">Fullname</label>
          <input
            type="name"
            id="name"
            className="form-control"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            className="form-control"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="submit-button" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default ParentSignUp;
