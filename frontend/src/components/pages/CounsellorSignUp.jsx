import React, { useState } from "react";
//import "./CounselorSignUp.css"; // Dark background styling

const CounselorSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone,setPhone]=useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Counselor Sign-up successful!");
    // Handle sign-up logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
    <h1 className="text-4xl font-bold text-indigo-400 mb-6">Counselor Sign Up</h1>
  
    <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
      <div className="mb-4">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="w-20 h-20"
        />
      </div>
  
      <form onSubmit={handleSubmit} className="w-full space-y-4">
      
        <div className="flex flex-col">
          <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone</label>
          <input
            type="tel"
            id="phone"
            className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
  
     
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
  
        
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            id="password"
            className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
  
        <button
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  </div>
  
  );
};

export default CounselorSignUp;
