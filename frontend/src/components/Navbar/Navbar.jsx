import React, { useState } from "react";
import { Bot, User, LogOut } from 'lucide-react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleBot = () => {
    window.location.href = 'https://fda5defddbb8db552a.gradio.live/';
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("accessToken"); // Ensure correct key
    if (!token) return;
  
    try {
      const response = await fetch("http://localhost:8000/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Remove this if not using cookies
      });
  
      if (response.ok) {
        sessionStorage.removeItem("accessToken"); // Correct key
        window.location.href = "/"; // Redirect after successful logout
      } else {
        console.error("Logout request failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div style={{ backgroundColor: "black" }}>
        <header className="text-gray-200 body-font">
          <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            {/* Logo */}
            <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/">
              <img src="plant.png" alt="Logo" style={{ height: "30px", width: "30px" }} />
              <span className="ml-3 text-xl text-blue-400">MindFull</span>
            </a>

            {/* Hamburger Menu Icon */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {/* Nav Links */}
            <nav
              className={`${
                menuOpen ? "flex" : "hidden"
              } flex-col md:flex md:flex-row gap-2 md:ml-auto items-center text-base justify-center`}
            >
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/createStory">Stories</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/activity">Activities</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/journals">Journals</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/video">Counsellor</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/Leaderboard">Leaderboard</a>
              <button
                onClick={handleBot}
                className="inline-flex items-center gap-2 text-black bg-green-500 border-0 py-2 px-5 focus:outline-none hover:bg-green-800 hover:text-white rounded text-base"
              >
                AI Chatbot <Bot size={24} />
              </button>
              {/* Profile Avatar */}
              <a href="/profile" className="ml-4 cursor-pointer">
                <User size={28} className="text-gray-300 hover:text-gray-500" />
              </a>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="ml-4 text-red-500 hover:text-red-700 flex items-center gap-2"
              >
                Logout <LogOut size={24} />
              </button>
            </nav>
          </div>
        </header>
      </div>
    </>
  );
}

export default Navbar;
