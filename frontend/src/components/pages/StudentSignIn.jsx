import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const StudentSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility toggle

  const handleSignIn = async (event) => {
    event.preventDefault();

    // Collect form data
    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const mood = event.target.mood.value;

    // Validate fields
    if (!email || !password || !mood || !username) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true); // Show loading state during login

    try {
      // API call to backend login endpoint
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/users/login`, {
        username,
        password,
        email,
        mood
      });

      if (response.status === 200) {
        const { user, accessToken, streak, maxStreak, suggestedActivity } =
          response.data.data;

        console.log("Login successful:", response.data);
        console.log(suggestedActivity)
        // Save user data and tokens
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));

        // Display streak and suggested activity
        alert(
          `Welcome back, ${user.username}!\nYour streak: ${streak}\nMax streak: ${maxStreak}\n`
        );

        // Redirect to dashboard
        navigate("/MainPage");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      alert(
        error.response?.data?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-green-600 mb-6">Welcome to Mindfull</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg">
        <div className="flex justify-center mb-4">
          <img
            src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
            alt="Welcome GIF"
            className="w-16 h-16"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center text-indigo-300 mb-4">Student Sign In</h2>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"} // Toggle password visibility
                id="password"
                name="password"
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-gray-300">Mood</label>
            <select
              id="mood"
              name="mood"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          <button
            type="submit"
            className="w-full py-2 text-lg font-bold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-400">
          <p>
            Don't have an account?{" "}
            <Link to="/student-signup" className="text-indigo-400 hover:underline">
              Click here to sign up
            </Link>
          </p>
          <p className="mt-2">
            Not a student?{" "}
            <Link to="/role-selection" className="text-indigo-400 hover:underline">
              Select your role
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignIn;
