import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import "./RoleSelection.css"; // Dark background styling

const RoleSelection = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleRoleSelection = () => {
    if (role === "Parent") {
      navigate("/parent-signin");
    } else if (role === "Counsellor") {
      navigate("/counsellor-signin");
    } else {
      alert("Please select a role to proceed.");
    }
  };

  return (
    <div className="container">
      <h1>Select Your Role</h1>
      <div className="gif-container">
        <img
          src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
          alt="Welcome GIF"
          className="welcome-gif"
        />
      </div>
      <div className="role-selection">
        <select onChange={(e) => setRole(e.target.value)} className="role-dropdown">
          <option value="">-- Select a Role --</option>
          <option value="Parent">Parent</option>
          <option value="Counsellor">Counsellor</option>
        </select>
        <button className="continue-button" onClick={handleRoleSelection}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
