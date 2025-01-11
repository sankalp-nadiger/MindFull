import React from 'react';
import { Link } from 'react-router-dom';
import "../SignInForm.css"
const SignInForm = () => (
  <div className="container mt-5 bg-dark ">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            {/* Welcome GIF/Image */}
            <div className="text-center my-4">
              <img
                src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" // Replace this URL with your GIF/image URL
                alt="Welcome"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <h3 className="card-title text-center ">Sign In</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Enter your email" />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Enter your password" />
              </div>
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary">Sign In</button>
                <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SignInForm;
