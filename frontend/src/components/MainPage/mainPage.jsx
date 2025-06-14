"use client";
import { Link } from "react-router-dom";
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
import Footer from "../Footer/Footer";
import Suggestion from "./activity";
import DynamicCarousel from "../pages/FetchPosts";
import ExerciseCards from "../Exercises/exercise";

export function HeroHighlightDemo() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [showStories, setShowStories] = useState(false);
  const [suggestedActivity, setSuggestedActivity] = useState(null);
  const [userMood, setUserMood] = useState(null);

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchUsername = async () => {
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
    };
    fetchUsername();
  }, []);
  
  useEffect(() => {
    const activity = sessionStorage.getItem("activity");
    setSuggestedActivity(activity);
  }, []);
  
  useEffect(() => {
    const mood = sessionStorage.getItem("mood");
    setUserMood(mood);
  }, []);


  const handleclick = () => {
    navigate("/Musicplayer");
  };

  return (
    // Add overflow-x-hidden to the main container to prevent horizontal scrolling
    <div className="overflow-x-hidden w-full">
      <Navbar />

      
      <div className="w-full">
        <HeroHighlight>
          <div className="min-h-[40vh] flex flex-col justify-center items-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [20, -5, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-700 dark:text-white flex flex-wrap justify-center gap-4"
            >
              Welcome,
              <Highlight
                className="text-black dark:text-white inline-block px-3 py-1 text-3xl md:text-5xl lg:text-6xl bg-gradient-to-r from-purple-500 to-blue-500 rounded-md shadow-md"
              >
                {loading ? "Loading..." : error ? `Error: ${error}` : username}
              </Highlight>
            </motion.h1>

            <div className="block w-full text-center text-xl md:text-2xl lg:text-3xl mt-6 dark:text-white">
              How's Your Day Today?
            </div>
          </div>
        </HeroHighlight>
      </div>

      <div className="bg-gray-200 w-full">
        <Getquotes />
      </div>

      <div className="bg-black w-full">
        <Suggestion />
      </div>

      <div className="p-6 bg-black w-full">
      <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
    <DynamicCarousel />
  </div>
</div>


      <div className="p-6 bg-black w-full">
        <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            TaskMaster: Your Smart To-Do List Assistant
          </h2>
          <p className="mt-2 text-gray-300 text-sm md:text-lg">
            Organize, prioritize, and complete your tasks efficiently. 
            Keep track of progress, manage deadlines, and stay on top of your goals.
          </p>
          <Link
            to="/todo"
            className="mt-4 bg-violet-600 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            View Tasks
          </Link>
        </div>
      </div>

      <div className="p-6 bg-black w-full">
        <div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 p-8 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-green-500/50 transition-shadow flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            VisionFull: Visualize Your Dreams Into Reality
          </h2>
          <p className="mt-2 text-gray-300 text-sm md:text-lg">
            Create digital vision boards that inspire and motivate. 
            Collect images, quotes, and aspirations that help manifest your goals and dreams.
          </p>
          <Link
            to="/vision-board"
            className="mt-4 bg-violet-600 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            View Vision Boards
          </Link>
        </div>
      </div>


      <div className="bg-gradient-to-b from-black via-violet-700 to-black text-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full">
          <div className="text-center lg:text-left space-y-6 max-w-md lg:max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Welcome to Your Music World
            </h1>
            <p className="text-lg md:text-xl text-white">
              Dive into a world of soothing melodies and rhythmic beats. Explore our mindfull library of music and let the tunes play on.
            </p>
            <button
              onClick={handleclick}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
            >
              Open Music Player
            </button>
          </div>

          <div className="mt-12 lg:mt-0 lg:w-1/2">
            <img
              src="music.jpg"
              alt="Music"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <ExerciseCards/>
      </div>

      <section className="text-white bg-black body-font w-full">
        <div className="container px-3 py-24 mx-auto">
          <div className="lg:w-2/3 flex flex-col sm:flex-row sm:items-center items-start mx-auto w-full">
            <h1 className="flex-grow sm:pr-16 text-3xl md:text-4xl lg:text-5xl font-medium title-font text-white">
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
    </div>
  );
}