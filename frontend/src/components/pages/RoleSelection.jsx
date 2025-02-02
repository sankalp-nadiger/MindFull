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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-950 to-black text-white px-6">
  <h1 className="text-4xl font-bold text-indigo-400 mb-6">Select Your Role</h1>

  <div className="w-full max-w-md p-6 bg-gray-900 shadow-lg rounded-lg flex flex-col items-center">
    <div className="mb-4">
      <img
        src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"
        alt="Welcome GIF"
        className="w-20 h-20"
      />
    </div>

    <div className="w-full">
      <select
        onChange={(e) => setRole(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">-- Select a Role --</option>
        <option value="Parent">Parent</option>
        <option value="Counsellor">Counsellor</option>
      </select>
    </div>

    <button
      className="mt-4 px-6 py-2 font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all"
      onClick={handleRoleSelection}
    >
      Continue
    </button>
  </div>
</div>

  );
};

export default RoleSelection;
