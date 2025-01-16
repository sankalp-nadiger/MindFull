import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("Fetching location...");
  const [idCard, setIdCard] = useState(null);
  const [showIdUpload, setShowIdUpload] = useState(false);

  const OPEN_CAGE_API_KEY = "YOUR_OPENCAGE_API_KEY";

  useEffect(() => {
    // Fetch coordinates using browser's Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchAddress(latitude, longitude);
        },
        (error) => {
          toast.error("Failed to fetch location. Please enable location access.");
          setLocation("Unable to fetch location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLocation("Geolocation not supported.");
    }
  }, []);

  // Fetch address details from OpenCage API
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${"a539a1f609ec48dba964a6ae2afd113f"}`
      );
      const { results } = response.data;
      if (results && results.length > 0) {
        const { formatted } = results[0];
        setLocation(formatted);
      } else {
        toast.error("Unable to fetch address details.");
        setLocation("Address not available.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching location details.");
      setLocation("Error fetching address.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(age, 10) < 18) {
      toast.error("Age is less than 18! Please upload your ID card.");
      setShowIdUpload(true);
    } else {
      toast.success("Sign-up successful!");
      console.log({
        fullName,
        email,
        password,
        age,
        gender,
        mood,
        location,
      });
    }
  };

  const handleIdUpload = (e) => {
    setIdCard(e.target.files[0]);
    toast.success("ID card uploaded successfully!");
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            className="form-control"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Age */}
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            className="form-control"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            className="form-control"
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
        {/* Mood */}
       
        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            className="form-control"
            value={location}
            readOnly
          />
        </div>
        {/* ID Upload (if age < 18) */}
        {showIdUpload && (
          <div className="form-group">
            <label htmlFor="idCard">Upload ID Card</label>
            <input
              type="file"
              id="idCard"
              className="form-control"
              onChange={handleIdUpload}
            />
          </div>
        )}
        {/* Submit Button */}
        <button className="submit-button" type="submit">
          Sign Up
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
