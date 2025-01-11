import React from "react";
import { Link } from "react-router-dom";

const SignupForm = () => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            {/* Welcome Image/GIF */}
            <div className="text-center my-4">
              <img
                src="https://media.giphy.com/media/j2pOGeGYKe2xCCKwfi/giphy.gif" // Replace with your welcome image/GIF URL
                alt="Welcome"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h3 className="card-title text-center">Sign Up</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="name" placeholder="Enter your full name" />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Enter your email" />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Create a password" />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm your password" />
              </div>
              <button type="submit" className="btn btn-primary w-100">Sign Up</button>
            </form>
            <p className="text-center mt-3">
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SignupForm;
