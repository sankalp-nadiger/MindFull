import React from "react";
import { Link } from "react-router-dom";
import "./StudentSignIn.css"; // Your custom styling

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to Mindful</h1>
      <div className="gif-container">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="welcome-gif"
        />
      </div>
      <div className="signin-options">
        <h2>Student Sign In</h2>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
            />
          </div>
          {/* Mood Field */}
          <div className="form-group">
            <label htmlFor="mood">Mood</label>
            <select
              id="mood"
              className="form-control"
              required
            >
              <option value="">Select Mood</option>
              <option value="Happy">😊 Happy</option>
              <option value="Sad">😢 Sad</option>
              <option value="Excited">🤩 Excited</option>
              <option value="Tired">😴 Tired</option>
              <option value="Angry">😡 Angry</option>
            </select>
          </div>
          <button type="submit" className="submit-button">
            Sign In
          </button>
        </form>
        <div className="links">
          <p>
            Don't have an account?{" "}
            <Link to="/student-signup" className="link">
              Click here to sign up
            </Link>
          </p>
          <p>
            Not a student?{" "}
            <Link to="/role-selection" className="link">
              Select your role
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
