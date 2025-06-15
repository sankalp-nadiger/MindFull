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

  const handleBotClick = () => {
    window.location.href = 'https://huggingface.co/spaces/vaibhav2154/MindFullBot';
  };

 return (
    <>
      <div className="relative bg-black">
        {/* Gradient overlay for merge effect - outflowing to page below */}
        <div className="absolute -bottom-6 left-0 right-0 h-16 bg-gradient-to-b from-blue-950/20 via-blue-950/9 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-4 left-0 right-0 h-12 bg-gradient-to-b from-green-800/10 via-red-900/10 to-transparent pointer-events-none"></div>
        
        {/* Subtle animated glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-blue-400/50 to-green-500/30 animate-pulse"></div>
        
        <header className="relative text-gray-200 body-font backdrop-blur-sm">
          <div className="container mx-auto flex justify-between items-center p-5">
            {/* Brand Logo - Left Side */}
            <a className="flex title-font font-medium items-center text-gray-900 group transition-all duration-300 hover:scale-105 flex-shrink-0" href="/MainPage">
              <div className="relative">
                <img src="plant.png" alt="Logo" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <span className="ml-3 text-xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent font-bold tracking-wide">
                MindFull
              </span>
            </a>

            {/* Mobile Menu Button - Right Side */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg p-2 transition-all duration-300 hover:bg-gray-800/50 hover:scale-110 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {/* Desktop Navigation - Right Side */}
            <nav className="hidden lg:flex lg:flex-row gap-1 xl:gap-2 items-center text-sm xl:text-base">
              {[
                { href: "/community", text: "Community" },
                { href: "/activity", text: "Activities" },
                { href: "/journals", text: "Journals" },
                { href: "/video", text: "Counsellor" },
                { href: "/Leaderboard", text: "Leaderboard" }
              ].map((item, index) => (
                <a 
                  key={item.href}
                  className="relative mr-2 xl:mr-5 px-2 xl:px-3 py-2 rounded-lg transition-all duration-300 hover:text-white group overflow-hidden whitespace-nowrap"
                  href={item.href}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{item.text}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-green-500/0 group-hover:from-blue-500/25 group-hover:via-blue-500/15 group-hover:to-green-500/10 transition-all duration-300 rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 group-hover:w-full transition-all duration-300"></div>
                </a>
              ))}
              
              <button
                onClick={handleBotClick}
                className="inline-flex items-center gap-1 xl:gap-2 text-black bg-gradient-to-r from-green-400 to-green-500 border-0 py-2 px-3 xl:px-5 focus:outline-none hover:from-green-500 hover:to-green-600 hover:shadow-lg hover:shadow-green-500/25 rounded-lg text-sm xl:text-base font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span className="hidden sm:inline">AI Chatbot</span>
                <span className="sm:hidden">AI Bot</span>
                <Bot size={18} className="xl:w-5 xl:h-5 transition-transform duration-300 group-hover:rotate-12" />
              </button>
              
              <a 
                href="/userprofile" 
                className="ml-2 xl:ml-4 cursor-pointer p-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/15 hover:scale-110 flex-shrink-0"
              >
                <User size={24} className="xl:w-7 xl:h-7 text-gray-300 hover:text-white transition-colors duration-300" />
              </a>
              
              <button 
                onClick={handleLogout} 
                className="ml-2 xl:ml-4 text-red-400 hover:text-red-300 flex items-center gap-1 xl:gap-2 p-2 rounded-lg transition-all duration-300 hover:bg-red-500/10 hover:scale-105 flex-shrink-0"
              >
                <span className="hidden xl:inline">Logout</span>
                <LogOut size={18} className="xl:w-5 xl:h-5 transition-transform duration-300 hover:rotate-12" />
              </button>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`${menuOpen ? "flex" : "hidden"} lg:hidden flex-col items-center bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50`}>
            <nav className="flex flex-col gap-2 py-4 w-full items-center text-base">
              {[
                { href: "/community", text: "Community" },
                { href: "/activity", text: "Activities" },
                { href: "/journals", text: "Journals" },
                { href: "/video", text: "Counsellor" },
                { href: "/Leaderboard", text: "Leaderboard" }
              ].map((item, index) => (
                <a 
                  key={item.href}
                  className="relative mb-2 px-6 py-3 rounded-lg transition-all duration-300 hover:text-white group overflow-hidden w-full max-w-xs text-center"
                  href={item.href}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{item.text}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-green-500/0 group-hover:from-blue-500/25 group-hover:via-blue-500/15 group-hover:to-green-500/10 transition-all duration-300 rounded-lg"></div>
                </a>
              ))}
              
              <button
                onClick={handleBotClick}
                className="inline-flex items-center gap-2 text-black bg-gradient-to-r from-green-400 to-green-500 border-0 py-3 px-6 focus:outline-none hover:from-green-500 hover:to-green-600 hover:shadow-lg hover:shadow-green-500/25 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105 mb-2"
              >
                <span>AI Chatbot</span>
                <Bot size={20} />
              </button>
              
              <div className="flex items-center gap-4 mt-2">
                <a 
                  href="/userprofile" 
                  className="cursor-pointer p-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/15 hover:scale-110"
                >
                  <User size={28} className="text-gray-300 hover:text-white transition-colors duration-300" />
                </a>
                
                <button 
                  onClick={handleLogout} 
                  className="text-red-400 hover:text-red-300 flex items-center gap-2 p-2 rounded-lg transition-all duration-300 hover:bg-red-500/10 hover:scale-105"
                >
                  <span>Logout</span>
                  <LogOut size={20} />
                </button>
              </div>
            </nav>
          </div>
        </header>
        
        {/* Additional subtle border effect - outflowing */}
        <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      </div>
      
      {/* Mock Chatbox component for demonstration */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gradient-to-r from-blue-500/10 to-green-500/10">
            <h3 className="text-white font-semibold">AI Chatbot</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 text-gray-300">
            <p>Hello! How can I help you today?</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
