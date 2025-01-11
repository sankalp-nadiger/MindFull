import React from "react";
import { Link } from "react-router-dom";
import "../SignUpForm.css"
const ForgotPasswordForm = () => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            {/* Reset Password Image/GIF */}
            <div className="text-center my-4">
              <img
                src="https://media.giphy.com/media/f9k1tV7HyORcngKF8v/giphy.gif" // Replace with your reset password image/GIF URL
                alt="Reset Password"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h3 className="card-title text-center">Forgot Password</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Enter your registered email" />
              </div>
              <button type="submit" className="btn btn-primary w-100">Reset Password</button>
            </form>
            <p className="text-center mt-3">
              Remembered your password? <Link to="/signin">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ForgotPasswordForm;
