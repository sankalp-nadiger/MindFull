"use client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { HeroHighlight, Highlight } from "./HeroHighlight";
import Navbar from "../Navbar/Navbar";
import { ChatInterface } from "../ChatBot/ChatInterface";
import { useNavigate } from "react-router-dom";
import LazyLoadWrapper from "../LazyLoad/LazyLoadWrapper";
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';

// Lazy load heavy components
const BentoGridDemo = React.lazy(() => import("./BentoGridDemo").then(module => ({ default: module.BentoGridDemo })));
const Getquotes = React.lazy(() => import("./quotes"));
const BadgesCorner = React.lazy(() => import("../Badges and Leaderboard/Badges"));
const Recommendations = React.lazy(() => import("../Materialrecommendation/AIrecommendation"));
const Footer = React.lazy(() => import("../Footer/Footer"));
const Suggestion = React.lazy(() => import("./activity"));
const DynamicCarousel = React.lazy(() => import("../pages/FetchPosts"));
const ExerciseCards = React.lazy(() => import("../Exercises/exercise"));
const FloatingChatButton = React.lazy(() => import("../ChatBot/FloatingChatButton"));
const MoodBasedMemories = React.lazy(() => import("../pages/MoodBasedMemories"));

export function HeroHighlightDemo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stories, setStories] = useState([]);
  const [showStories, setShowStories] = useState(false);
  const [suggestedActivity, setSuggestedActivity] = useState(null);
  const [userMood, setUserMood] = useState(null);

  const token = useMemo(() => sessionStorage.getItem("accessToken"), []);
  
  // Memoized fetch functions
  const fetchUsername = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/current`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (data.data && data.data.username) {
        setUsername(data.data.username);
      } else {
        throw new Error("User data is missing in API response.");
      }
    } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
  }, [token]);

  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]);
  
  const fetchStories = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/stories`);
      if (!response.ok) throw new Error("Failed to fetch stories");
      const data = await response.json();
      setStories(data);
    } catch (err) {
      console.error(err.message);
    }
  }, []);

  const handleStoryClick = useCallback(() => {
    setShowStories(!showStories);
    if (!showStories) fetchStories();
  }, [showStories, fetchStories]);

  const handleAddStory = useCallback(async () => {
    const formData = new FormData();
    formData.append("content", "Your story content");
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/addStory`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add story");
      fetchStories();
    } catch (err) {
      console.error(err.message);
    }
  }, [token, fetchStories]);

  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]);
  
  useEffect(() => {
    const activity = sessionStorage.getItem("activity");
    setSuggestedActivity(activity);
  }, []);
  
  useEffect(() => {
    const mood = sessionStorage.getItem("mood");
    setUserMood(mood);
  }, []);

  // Memoized components for better performance
  const MemoizedNavbar = useMemo(() => <Navbar onStoryClick={handleStoryClick} />, [handleStoryClick]);

  const handleclick = useCallback(() => {
    navigate("/Musicplayer");
  }, [navigate]);

  // Loading fallback component
  const ComponentFallback = () => (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-b-2 border-purple-500 rounded-full animate-spin"></div>
    </div>
  );
  
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      
      <div className="w-full relative z-30 font-poppins">
        <HeroHighlight>
          <div className="min-h-[40vh] flex flex-col justify-center items-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [20, -5, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="flex flex-wrap justify-center gap-4 text-4xl font-bold md:text-6xl lg:text-7xl text-neutral-700 dark:text-white"
            >
              {t('dashboard.welcome')},
              <Highlight
                className="inline-block px-3 py-1 text-3xl text-black rounded-md shadow-md dark:text-white md:text-5xl lg:text-6xl bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {loading ? t('common.loading') : error ? `${t('common.error')}: ${error}` : username}
              </Highlight>
            </motion.h1>            
            <div className="block w-full mt-6 text-xl text-center md:text-2xl lg:text-3xl dark:text-white">
              {t('dashboard.todayQuestion')}
            </div>
          </div>
        </HeroHighlight>
      </div>

      {/* Fixed watermark logo - starts after hero section, always centered and visible */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.05] pointer-events-none z-20"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />

      {/* Solid black background sections without grid */}
      <div className="w-full bg-black relative z-10">
        <div className="w-full ">
          <Getquotes />
        </div>

        <div className="w-full relative z-10">
          <Suggestion />
        </div>

        <div className="w-full p-6 relative z-10 font-poppins">
          <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-sm bg-blue-950/40 opacity-90 bg-opacity-20 p-8 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
            <DynamicCarousel />
          </div>
        </div>

        {/* TaskMaster and VisionFull Cards - Rounded on all edges */}
        <div className="w-full p-6 relative z-10">
          <div className="max-w-[85rem] mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* TaskMaster Card */}
              <div className="relative group text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 bg-blue-950/40 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:blur-sm before:translate-x-[-100%] group-hover:before:translate-x-[200%] before:rotate-12 before:transition before:duration-1000 before:ease-in-out" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-4 text-4xl">📋</div>
                  <h2 className="text-2xl font-bold md:text-3xl">
                    TaskMaster
                  </h2>
                  <p className="text-sm font-medium text-purple-400 mb-2">
                    Your Smart To-Do List Assistant
                  </p>
                  <p className="mt-2 text-sm text-gray-300 md:text-base flex-grow">
                    Organize, prioritize, and complete your tasks efficiently. 
                    Keep track of progress, manage deadlines, and stay on top of your goals.
                  </p>
                  <Link
                    to="/todo"
                    className="px-6 py-3 mt-6 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 shadow-lg"
                  >
                    Manage Tasks
                  </Link>
                </div>
              </div>

              {/* VisionFull Card */}
              <div className="relative group text-white bg-blue-950/40 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:blur-sm before:translate-x-[-100%] group-hover:before:translate-x-[200%] before:rotate-12 before:transition before:duration-1000 before:ease-in-out" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-4 text-4xl">🎯</div>
                  <h2 className="text-2xl font-bold md:text-3xl">
                    VisionFull
                  </h2>
                  <p className="text-sm font-medium text-green-400 mb-2">
                    Visualize Your Dreams Into Reality
                  </p>
                  <p className="mt-2 text-sm text-gray-300 md:text-base flex-grow">
                    Create digital vision boards that inspire and motivate. 
                    Collect images, quotes, and aspirations that help manifest your goals and dreams.
                  </p>
                  <Link
                    to="/vision-board"
                    className="px-6 py-3 mt-6 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transform hover:scale-105 shadow-lg"
                  >
                    Create Vision Board
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid background starts from Music World section */}
      <div className="w-full relative">
        {/* Edge blur masks - top, left, right */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        
        {/* Overall subtle overlay to reduce line brightness */}
        <div className="absolute inset-0 bg-black/20 z-5 pointer-events-none"></div>
        
        <div className="w-full" style={{
          '--color': 'rgba(114, 114, 114, 0.23)',
          backgroundColor: '#000000',
          backgroundImage: `
            linear-gradient(0deg,
              transparent 24%,
              var(--color) 25%,
              var(--color) 26%,
              transparent 27%,
              transparent 74%,
              var(--color) 75%,
              var(--color) 76%,
              transparent 77%,
              transparent
            ),
            linear-gradient(90deg,
              transparent 24%,
              var(--color) 25%,
              var(--color) 26%,
              transparent 27%,
              transparent 74%,
              var(--color) 75%,
              var(--color) 76%,
              transparent 77%,
              transparent
            )
          `,
          backgroundSize: '55px 55px',
        }}>
          
          {/* Music World Section */}
          <div className="flex flex-col items-center justify-center w-full px-4 py-12 font-poppins text-gray-100 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center justify-between w-full mx-auto lg:flex-row max-w-7xl">
              <div className="max-w-md space-y-6 text-center lg:text-left lg:max-w-xl">
                <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  Welcome to Your Music World
                </h1>
                <p className="text-lg text-white md:text-xl">
                  Dive into a world of soothing melodies and rhythmic beats. Explore our Soulynk library of music and let the tunes play on.
                </p>
                <button
                  onClick={handleclick}
                  className="px-6 py-3 font-semibold text-white transition duration-300 bg-purple-500 rounded-full hover:bg-purple-600"
                >
                  Open Music Player
                </button>
              </div>

              <div className="mt-12 lg:mt-0 lg:w-1/2 group relative overflow-hidden rounded-lg shadow-lg">
                <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:blur-sm before:translate-x-[-100%] group-hover:before:translate-x-[200%] before:rotate-12 before:transition before:duration-1000 before:ease-in-out" />
                <img
                  src="music.jpg"
                  alt="Music"
                  className="object-cover w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="w-full font-poppins">
            <ExerciseCards/>      
          </div>

          {/* Footer Section */}
          <section className="w-full text-white body-font relative z-10">
            <BentoGridDemo />
            {/* <BadgesCorner /> */}
            <Footer />
          </section>

          {/* Floating Chat Button */}
          <FloatingChatButton />
        </div>
      </div>
    </div>
  );
}