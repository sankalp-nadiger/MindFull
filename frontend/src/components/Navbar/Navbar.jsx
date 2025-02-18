import React, { useState } from "react";
import { Bot, User, LogOut } from 'lucide-react';
import Chatbox from "../pages/Chatbot";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/";
      } else {
        console.error("Logout request failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <div className="bg-black">
        <header className="text-gray-200 body-font">
          <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/MainPage">
              <img src="plant.png" alt="Logo" className="h-8 w-8" />
              <span className="ml-3 text-xl text-blue-400">MindFull</span>
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <nav className={`$ {menuOpen ? "flex" : "hidden"} md:flex md:flex-row gap-2 md:ml-auto items-center text-base justify-center`}>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/community">Community</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/activity">Activities</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/journals">Journals</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/video">Counsellor</a>
              <a className="mb-2 md:mb-0 md:mr-5 hover:text-gray-500" href="/Leaderboard">Leaderboard</a>
              
              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-2 text-black bg-green-500 border-0 py-2 px-5 focus:outline-none hover:bg-green-800 hover:text-white rounded text-base"
              >
                AI Chatbot <Bot size={24} />
              </button>
              
              <a href="/userprofile" className="ml-4 cursor-pointer">
                <User size={28} className="text-gray-300 hover:text-gray-500" />
              </a>
              
              <button onClick={handleLogout} className="ml-4 text-red-500 hover:text-red-700 flex items-center gap-2">
                Logout <LogOut size={24} />
              </button>
            </nav>
          </div>
        </header>
      </div>
      {isChatOpen && <Chatbox onClose={() => setIsChatOpen(false)} />}
    </>
  );
}

export default Navbar;
