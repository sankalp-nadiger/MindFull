import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentSignIn.css"; // Using the same CSS file as StudentSignIn

const ParentSignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!otpSent) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, { mobileNumber: phone });
        if (response.data.success) {
          setOtpSent(true);
          // Start a 60-second timer for OTP expiration
          setOtpTimer(60);
          const interval = setInterval(() => {
            setOtpTimer(prevTimer => {
              if (prevTimer <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prevTimer - 1;
            });
          }, 1000);
          
          alert("OTP sent to your phone.");
        } else {
          alert("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        alert("Error sending OTP: " + error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/register-parent`, {
        fullName: name,
        password,
        mobileNumber: phone,
        otp,
      });

      if (response.status === 201) {
        alert("Parent Sign-up successful!");
        navigate("/parentDashboard");
      } else {
        alert("Registration failed: " + response.data.message);
      }
    } catch (error) {
      alert("Error during registration: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/parent/send-otp`, { mobileNumber: phone });
      if (response.data.success) {
        setOtpTimer(60);
        const interval = setInterval(() => {
          setOtpTimer(prevTimer => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
        
        alert("OTP resent to your phone.");
      } else {
        alert("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      alert("Error resending OTP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h1 className="app-title parent">Mindfull</h1>

      <div className="auth-card">
        <div className="card-header">
          <img
            src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
            alt="Welcome GIF"
            className="welcome-animation"
          />
          <h2 className="card-title">Parent Sign Up</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-button">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="input-button"
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp" className="form-label">OTP</label>
              <div className="otp-container">
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  className="form-input otp-input"
                  placeholder="Enter OTP sent to your phone"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                {otpTimer > 0 ? (
                  <div className="otp-timer">Resend in {otpTimer}s</div>
                ) : (
                  <button 
                    type="button" 
                    onClick={resendOtp} 
                    className="secondary-button"
                    style={{ marginTop: 0, width: 'auto', padding: '0.5rem 1rem' }}
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="primary-button parent-button"
            disabled={loading}
          >
            {loading ? "Processing..." : (otpSent ? "Complete Sign-Up" : "Send OTP")}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/parent-signin" className="auth-link parent">
              Sign in here
            </Link>
          </p>
          <p>
            Not a parent?{" "}
            <Link to="/role-selection" className="auth-link parent">
              Select your role
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ParentSignUp;