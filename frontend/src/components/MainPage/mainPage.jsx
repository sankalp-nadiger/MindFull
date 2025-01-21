"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { HeroHighlight, Highlight } from "./HeroHighlight"
import Navbar from "../Navbar/Navbar";
import { ChatInterface } from "../ChatBot/ChatInterface";
import { Bot } from 'lucide-react';
import { BentoGridDemo } from "./BentoGridDemo";
import Getquotes from "./quotes";
export function HeroHighlightDemo() {

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchUsername = async () => {
      try {
    
        const response = await fetch('http://localhost:5000/api/username');


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
       {/* {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
         {username}
      )} */}
      Sujith Kumar
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
     {/* Chat interface */}
     {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-[400px] h-[400px] z-50">
          <ChatInterface />
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-900 transition-colors z-50"
      >
        <Bot size={24} />
      </button>
    </>
  );
}
