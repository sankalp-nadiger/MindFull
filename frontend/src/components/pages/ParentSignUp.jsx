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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
  <h1 className="text-4xl font-bold text-indigo-400 mb-6">Parent Sign Up</h1>

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
        <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
        <input
          type="text"
          id="name"
          className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      <div className="flex flex-col">
        <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</label>
        <input
          type="tel"
          id="phone"
          className="mt-1 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
      >
        Sign Up
      </button>
    </form>
  </div>
</div>

  );
};

export default ParentSignUp;
