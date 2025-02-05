"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { HeroHighlight, Highlight } from "./HeroHighlight";
import Navbar from "../Navbar/Navbar";
import { ChatInterface } from "../ChatBot/ChatInterface";
import { useNavigate } from "react-router-dom";
import { BentoGridDemo } from "./BentoGridDemo";
import Getquotes from "./quotes";
import BadgesCorner from "../Badges and Leaderboard/Badges";
import Recommendations from "../Materialrecommendation/AIrecommendation";
import Stories from "../pages/FetchStory";
import Footer from "../Footer/Footer";

export function HeroHighlightDemo() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [showStories, setShowStories] = useState(false);

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/current", {
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
    };
    fetchUsername();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users/stories");
      if (!response.ok) throw new Error("Failed to fetch stories");
      const data = await response.json();
      setStories(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleStoryClick = () => {
    setShowStories(!showStories);
    if (!showStories) fetchStories();
  };

  const handleAddStory = async () => {
    const formData = new FormData();
    formData.append("content", "Your story content"); // Replace with actual file input
    try {
      const response = await fetch("http://localhost:8000/api/users/addStory", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add story");
      fetchStories();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <Navbar onStoryClick={handleStoryClick} />

      {showStories && (
        <div className="flex overflow-x-auto p-4 bg-gray-900 text-white gap-4">
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={handleAddStory}
          >
            <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-black">
              +
            </div>
            <p className="text-sm">Add Story</p>
          </div>
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center">
              <img
                src={story.avatar}
                alt={story.username}
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
              <p className="text-sm">{story.username}</p>
            </div>
          ))}
        </div>
      )}

      {/* HeroHighlight Section */}
      <div style={{ height: "50vh", width: "100%" }}>
      <HeroHighlight>
  <div className="min-h-[50vh] flex flex-col justify-center items-center text-center">
    <motion.h1 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: [20, -5, 0] }} 
      transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }} 
      className="text-5xl md:text-7xl lg:text-8xl font-bold text-neutral-700 dark:text-white flex items-center gap-4"
    >
      Welcome,
      <Highlight
        className="text-black dark:text-white inline-block px-3 py-1 text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-500 to-blue-500 rounded-md shadow-md whitespace-nowrap"
      >
        {loading ? "Loading..." : error ? `Error: ${error}` : username}
      </Highlight>
    </motion.h1>

    {/* Ensure greeting is visible */}
    <div className="block w-full text-center text-xl md:text-3xl lg:text-4xl mt-6 dark:text-white">
      How's Your Day Today?
    </div>
  </div>
</HeroHighlight>

      </div>

      {/* Additional Sections */}
      <div className="bg-gray-200">
        <Getquotes />
      </div>
      <div className="bg-black">
        <Stories />
      </div>
      <Recommendations />

      <section className="text-white bg-black body-font">
        <div className="container px-3 py-24 mx-auto">
          <div className="lg:w-2/3 flex flex-col sm:flex-row sm:items-center items-start mx-auto w-full">
            <h1 className="flex-grow sm:pr-16 text-5xl font-medium title-font text-white">
              Activity Recommendations Curated for YOU .....
            </h1>
            <button
              onClick={() => navigate("/activity")}
              className="text-black bg-green-600 py-2 px-8 hover:bg-green-400 rounded text-lg mt-10 sm:mt-0"
            >
              See Activities
            </button>
          </div>
        </div>
        <BentoGridDemo />
        <BadgesCorner />
        <Footer />
      </section>

      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-[400px] h-[400px] z-50">
          <ChatInterface />
        </div>
      )}
    </>
  );
}
