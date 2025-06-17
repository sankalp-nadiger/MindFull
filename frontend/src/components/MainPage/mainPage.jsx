"use client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { HeroHighlight, Highlight } from "./HeroHighlight";
import Navbar from "../Navbar/Navbar";
import { ChatInterface } from "../ChatBot/ChatInterface";
import { useNavigate } from "react-router-dom";
import LazyLoadWrapper from "../LazyLoad/LazyLoadWrapper";

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

      
      <div className="w-full">
        <HeroHighlight>
          <div className="min-h-[40vh] flex flex-col justify-center items-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [20, -5, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="flex flex-wrap justify-center gap-4 text-4xl font-bold md:text-6xl lg:text-7xl text-neutral-700 dark:text-white"
            >
              Welcome,
              <Highlight
                className="inline-block px-3 py-1 text-3xl text-black rounded-md shadow-md dark:text-white md:text-5xl lg:text-6xl bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {loading ? "Loading..." : error ? `Error: ${error}` : username}
              </Highlight>
            </motion.h1>

            <div className="block w-full mt-6 text-xl text-center md:text-2xl lg:text-3xl dark:text-white">
              How's Your Day Today?
            </div>
          </div>
        </HeroHighlight>
      </div>

      <div className="w-full bg-gray-200">
        <Getquotes />
      </div>

      <div className="w-full bg-black">
        <Suggestion />
      </div>

      <div className="w-full p-6 bg-black">
      <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
    <DynamicCarousel />
  </div>
</div>


      <div className="w-full p-6 bg-black">
        <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            TaskMaster: Your Smart To-Do List Assistant
          </h2>
          <p className="mt-2 text-sm text-gray-300 md:text-lg">
            Organize, prioritize, and complete your tasks efficiently. 
            Keep track of progress, manage deadlines, and stay on top of your goals.
          </p>
          <Link
            to="/todo"
            className="px-6 py-2 mt-4 font-medium text-white transition rounded-lg bg-violet-600 hover:bg-blue-600"
          >
            View Tasks
          </Link>
        </div>      </div>

      <div className="w-full p-6 bg-black">
        <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            VisionFull: Visualize Your Dreams Into Reality
          </h2>
          <p className="mt-2 text-sm text-gray-300 md:text-lg">
            Create digital vision boards that inspire and motivate. 
            Collect images, quotes, and aspirations that help manifest your goals and dreams.
          </p>
          <Link
            to="/vision-board"
            className="px-6 py-2 mt-4 font-medium text-white transition rounded-lg bg-violet-600 hover:bg-blue-600"
          >
            View Vision Boards
          </Link>
        </div>
      </div>


      <div className="flex flex-col items-center justify-center w-full px-4 py-12 text-gray-100 bg-gradient-to-b from-black via-violet-700 to-black sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between w-full mx-auto lg:flex-row max-w-7xl">
          <div className="max-w-md space-y-6 text-center lg:text-left lg:max-w-xl">
            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Welcome to Your Music World
            </h1>
            <p className="text-lg text-white md:text-xl">
              Dive into a world of soothing melodies and rhythmic beats. Explore our mindfull library of music and let the tunes play on.
            </p>
            <button
              onClick={handleclick}
              className="px-6 py-3 font-semibold text-white transition duration-300 bg-purple-500 rounded-full hover:bg-purple-600"
            >
              Open Music Player
            </button>
          </div>

          <div className="mt-12 lg:mt-0 lg:w-1/2">
            <img
              src="music.jpg"
              alt="Music"
              className="object-cover w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <ExerciseCards/>      </div>

      <section className="w-full text-white bg-black body-font">
        <div className="container px-3 py-24 mx-auto">
          <div className="flex flex-col items-start w-full mx-auto lg:w-2/3 sm:flex-row sm:items-center">
            <h1 className="flex-grow text-3xl font-medium text-white sm:pr-16 md:text-4xl lg:text-5xl title-font">
              Activity Recommendations Curated for YOU .....
            </h1>
            <button
              onClick={() => navigate("/activity")}
              className="px-8 py-2 mt-10 text-lg text-black bg-green-600 rounded hover:bg-green-400 sm:mt-0">
              See Activities
            </button>
          </div>
        </div>
        
        <BentoGridDemo />
        <BadgesCorner />
        <Footer />
      </section>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  );
}