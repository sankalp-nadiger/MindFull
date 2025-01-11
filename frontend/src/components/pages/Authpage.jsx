import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPassword from './ForgotPassword';

const AuthPage = () => (
  <Router>
    <div className="text-center my-4">
      <Link to="/" className="btn btn-outline-primary mx-2">Sign In</Link>
      <Link to="/sign-up" className="btn btn-outline-secondary mx-2">Sign Up</Link>
    </div>
    <Routes>
      <Route path="/" element={<SignInForm />} />
      <Route path="/sign-up" element={<SignUpForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  </Router>
);

export default AuthPage;
