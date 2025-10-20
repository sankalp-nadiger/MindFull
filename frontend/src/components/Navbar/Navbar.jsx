import React, { useState, memo, useCallback } from "react";
import { Bot, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Chatbox from "../pages/Chatbot";

const Navbar = memo(({ onStoryClick }) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = useCallback(async () => {
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
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

 return (
    <>
      <div className="relative bg-black">
        {/* Gradient overlay for merge effect - outflowing to page below */}
        <div className="absolute left-0 right-0 h-16 pointer-events-none -bottom-6 bg-gradient-to-b from-blue-950/20 via-blue-950/9 to-transparent"></div>
        <div className="absolute left-0 right-0 h-12 pointer-events-none -bottom-4 bg-gradient-to-b from-green-800/10 via-red-900/10 to-transparent"></div>
        
        {/* Subtle animated glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-blue-400/50 to-green-500/30 animate-pulse"></div>
        
        <header className="relative text-gray-200 body-font backdrop-blur-sm">
          <div className="container flex items-center justify-between p-5 mx-auto">
            {/* Brand Logo - Left Side */}
            <a className="flex items-center flex-shrink-0 font-medium text-gray-900 transition-all duration-300 title-font group hover:scale-105" href="/MainPage">
              <div className="relative">
                <img src="1a.png" alt="Logo" className="w-14 h-14 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 group-hover:opacity-100 blur-sm"></div>
              </div>
              <span className="ml-3 text-3xl font-serif tracking-wide text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-green-300 bg-clip-text" style={{ fontFamily: 'Georgia, Times, serif' }}>
                Soulynk
              </span>
            </a>

            {/* Mobile Menu Button - Right Side */}
            <button
              onClick={toggleMenu}
              className="flex-shrink-0 p-2 text-gray-200 transition-all duration-300 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:bg-gray-800/50 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>            {/* Desktop Navigation - Right Side */}
            <nav className="items-center hidden gap-1 text-sm lg:flex lg:flex-row xl:gap-2 xl:text-base">
              {[
                { href: "/community", text: t('navigation.community') },
                { href: "/activity", text: t('navigation.activities') },
                { href: "/journals", text: t('navigation.journals') },
                { href: "/video", text: t('navigation.counsellor') },
                { href: "/Leaderboard", text: t('navigation.leaderboard') }
              ].map((item, index) => (
                <a 
                  key={item.href}
                  className="relative px-2 py-2 mr-2 overflow-hidden transition-all duration-300 rounded-lg xl:mr-5 xl:px-3 hover:text-white group whitespace-nowrap"
                  href={item.href}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{item.text}</span>
                  <div className="absolute inset-0 transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-green-500/0 group-hover:from-blue-500/25 group-hover:via-blue-500/15 group-hover:to-green-500/10"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 group-hover:w-full transition-all duration-300"></div>
                </a>
              ))}
              <a 
                href="/userprofile" 
                className="flex-shrink-0 p-2 ml-2 transition-all duration-300 rounded-full cursor-pointer xl:ml-4 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/15 hover:scale-110"
              >
                <User size={24} className="text-gray-300 transition-colors duration-300 xl:w-7 xl:h-7 hover:text-white" />
              </a>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center flex-shrink-0 gap-1 p-2 ml-2 text-red-400 transition-all duration-300 rounded-lg xl:ml-4 hover:text-red-300 xl:gap-2 hover:bg-red-500/10 hover:scale-105"
              >
                <span className="hidden xl:inline">{t('common.logout')}</span>
                <LogOut size={18} className="transition-transform duration-300 xl:w-5 xl:h-5 hover:rotate-12" />
              </button>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`${menuOpen ? "flex" : "hidden"} lg:hidden flex-col items-center bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50`}>            <nav className="flex flex-col items-center w-full gap-2 py-4 text-base">
              {[
                { href: "/community", text: t('navigation.community') },
                { href: "/activity", text: t('navigation.activities') },
                { href: "/journals", text: t('navigation.journals') },
                { href: "/video", text: t('navigation.counsellor') },
                { href: "/Leaderboard", text: t('navigation.leaderboard') }
              ].map((item, index) => (
                <a 
                  key={item.href}
                  className="relative w-full max-w-xs px-6 py-3 mb-2 overflow-hidden text-center transition-all duration-300 rounded-lg hover:text-white group"
                  href={item.href}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{item.text}</span>
                  <div className="absolute inset-0 transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-green-500/0 group-hover:from-blue-500/25 group-hover:via-blue-500/15 group-hover:to-green-500/10"></div>
                </a>
              ))}
              
                <div className="flex items-center gap-4 mt-2">
                <a 
                  href="/userprofile" 
                  className="p-2 transition-all duration-300 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/15 hover:scale-110"
                >
                  <User size={28} className="text-gray-300 transition-colors duration-300 hover:text-white" />
                </a>
                  
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 p-2 text-red-400 transition-all duration-300 rounded-lg hover:text-red-300 hover:bg-red-500/10 hover:scale-105"
                >
                  <span>{t('common.logout')}</span>
                  <LogOut size={20} />
                </button>
              </div>
            </nav>
          </div>
        </header>
        
        {/* Additional subtle border effect - outflowing */}
        <div className="absolute left-0 right-0 h-px -bottom-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      </div>

    </>
  );
});

export default Navbar;
