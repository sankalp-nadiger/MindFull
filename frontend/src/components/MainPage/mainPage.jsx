"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { HeroHighlight, Highlight } from "./HeroHighlight"
import Navbar from "../Navbar/Navbar";
import { ChatInterface } from "../ChatBot/ChatInterface";
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { BentoGridDemo } from "./BentoGridDemo";
import Getquotes from "./quotes";
import BadgesCorner from "../Badges and Leaderboard/Badges";
import Recommendations from "../Materialrecommendation/AIrecommendation";

import Footer from "../Footer/Footer";
export function HeroHighlightDemo() {
  const navigate = useNavigate(); 

  
  const handleactivity = () => {
    navigate('/activity'); 
  };

  const handlebot=()=>{
    window.location.href = 'https://fda5defddbb8db552a.gradio.live/';
  }


  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchUsername = async () => {
      try {
    
        const response = await fetch('http://localhost:3000/api/user/current');


        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

    
        const data = await response.json();

    
        setUsername(data.username);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, []); 

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
    
    <Navbar/>
    <div style={{height:"70%",width:"100%"}}>
    <HeroHighlight>
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className=" flex flex-wrap top-0 align-top justify-center text-2xl px-0 md:text-5xl lg:text-8xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
      >
        Welcome,
        <Highlight className=" text-black dark:text-white px-2">
       {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
         {username}
      )} 
      
        </Highlight>
        <div className="  block text-2xl px-4 md:text-4xl lg:text-5xl">How's Your Day Today ?</div>
      </motion.h1>
    </HeroHighlight>
    </div>

    <div className="bg-gray-200">
       <Getquotes/> 
    </div>
    <div className="bg-black">
    <BentoGridDemo/>
    </div>
    <section class="text-white bg-black body-font">
  <div class="container px-3 py-24 mx-auto">
    <div class="lg:w-2/3 flex flex-col sm:flex-row sm:items-center items-start mx-auto w-full">
      <h1 class="flex-grow sm:pr-16 text-5xl font-medium title-font text-white">Activity Recommendations Curated for YOU .....</h1>
      <button onClick={handleactivity} className="flex-shrink-0 text-black bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-400 rounded text-lg mt-10 sm:mt-0">See Activities</button>
    </div>
  </div>
  <Recommendations/>
  <BadgesCorner/>
  <Footer/>
</section>
     {/* Chat interface */}
     {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-[400px] h-[400px] z-50">
          <ChatInterface />
        </div>
      )}

     

    </>
  );
}
