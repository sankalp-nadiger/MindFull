import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentSignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [idCardFile, setIdCardFile] = useState(null);
  const [location, setLocation] = useState(null); // For storing latitude and longitude
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [showIdUpload, setShowIdUpload] = useState(false);

  const navigate = useNavigate(); // Hook for navigation

  // Function to get the user's geolocation
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Assuming you can obtain the address, if not, you can use reverse geocoding API like Google Maps API or OpenStreetMap.
          const address = "Sample Address";  // Replace with reverse geocoding logic if necessary

          // Construct the proper JSON format expected by the backend
          const locationData = {
            type: "Point",  // Assuming GeoJSON format for coordinates
            coordinates: [longitude, latitude], // [longitude, latitude] format
            address: address // Address should be retrieved via reverse geocoding
          };

          // Send the location data to the backend
          setLocation(locationData);
          toast.success("Location retrieved successfully!");
        },
        (error) => {
          toast.error("Unable to retrieve your location. Please enable geolocation.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Age validation
    if (parseInt(age, 10) < 18 && !idCardFile) {
      toast.error("ID card upload is required for users under 18.");
      return;
    }

    if (!location) {
      toast.error("Location is required. Please allow location access.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("location", JSON.stringify(location)); // Add location to form data
    if (idCardFile) formData.append("idCardFile", idCardFile);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
        withCredentials: true, // Ensures cookies (accessToken, refreshToken) are included if using HTTP-only cookies
      });

      // Extract data from response
      if (response.status === 201) {
        console.log(response.data)
        const { accessToken, createdUser } = response.data.data || {}; // Ensure correct response structure

        toast.success("User registered successfully!");

        // Store accessToken and user data only if they exist
        if (accessToken) {
          sessionStorage.setItem("accessToken", accessToken);
        }

        if (createdUser) {
          sessionStorage.setItem("user", JSON.stringify(createdUser));
        }

        // Navigate only after storing data
        navigate("/phase1");
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.message || "Error during registration");
    }
  };

  const handleIdCardUpload = (e) => {
    setIdCardFile(e.target.files[0]);
    toast.success("ID card uploaded successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Sign Up</h1>

      <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-300">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="age" className="block text-gray-300">Age</label>
            <input
              type="number"
              id="age"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-gray-300">Gender</label>
            <select
              id="gender"
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button 
              type="button" 
              className="px-4 py-2 font-semibold bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
              onClick={getLocation}
            >
              Get Location
            </button>
          </div>

          {parseInt(age, 10) < 18 && (
            <div>
              <label htmlFor="idCard" className="block text-gray-300">Upload ID Card</label>
              <input
                type="file"
                id="idCard"
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={handleIdCardUpload}
              />
            </div>
          )}

          <button 
            className="w-full py-2 text-lg font-bold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition-all"
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default StudentSignUp;
