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
      const response = await axios.post("http://localhost:8000/api/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });
      toast.success("User registered successfully!");
      navigate("/phase1"); // Navigate to Phase 1 after successful signup
    } catch (error) {
      toast.error(error.response?.data?.message || "Error during registration");
    }
  };

  const handleIdCardUpload = (e) => {
    setIdCardFile(e.target.files[0]);
    toast.success("ID card uploaded successfully!");
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-control"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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

        {/* Add button to get location */}
        <div className="form-group">
          <button type="button" className="btn btn-info" onClick={getLocation}>
            Get Location
          </button>
        </div>

        {parseInt(age, 10) < 18 && (
          <div className="form-group">
            <label htmlFor="idCard">Upload ID Card</label>
            <input
              type="file"
              id="idCard"
              className="form-control"
              onChange={handleIdCardUpload}
            />
          </div>
        )}

        <button className="btn btn-primary" type="submit">
          Sign Up
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default StudentSignUp;
