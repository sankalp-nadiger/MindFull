"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React from "react";
import { useTranslation } from 'react-i18next';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const HeroHighlight = ({
  children,
  className,
  containerClassName
}) => {
  const { t } = useTranslation();
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  
  // Feature hashtags to display at the bottom
  const features = ["#ThinkToDo", "#MakeVision", "#SoulfulMusic", "#BreatheGood", "#YourPicks"];
  
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY
  }) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };
  
  return (
    <div
      className={cn(
        "relative h-[400px] flex items-center bg-white dark:bg-black justify-center w-full group",
        containerClassName
      )}
      onMouseMove={handleMouseMove}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 bg-dot-thick-neutral-300 dark:bg-dot-thick-neutral-800 pointer-events-none" />
      
      {/* Highlight effect - increased the z-index to be above all elements except interactive ones */}
      <motion.div
        className="pointer-events-none bg-dot-thick-indigo-500 dark:bg-dot-thick-indigo-500 absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 z-15"
        style={{
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }} />
      
      {/* #AIEnabled positioned at top center - made sure z-index doesn't block hover effect */}
      <div className="absolute top-6 left-0 right-0 flex justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 opacity-70 hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto">
        #AIEnabled
      </div>
      
      {/* Main content */}
      <div className={cn("relative z-20 pointer-events-auto", className)}>{children}</div>
      
      {/* Feature hashtags with appropriate pointer events and z-index */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center w-full z-20 pointer-events-none">
        <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-4 pointer-events-none">
          {features.map((feature, index) => (
            <div 
              key={`feature-${index}`} 
              className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 opacity-30 hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll down button - separated from hashtags */}
      <button 
        onClick={handleScrollDown}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-20 opacity-70 hover:opacity-100 transition-opacity duration-300"
      >
        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">{t('hero.explore')}</div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-bounce" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  );
};

export const Highlight = ({
  children,
  className
}) => {
  return (
    <motion.span
      initial={{
        backgroundSize: "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: 2,
        ease: "linear",
        delay: 0.5,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        `relative inline-block pb-1 px-0 rounded-lg bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500`,
        className
      )}>
      {children}
    </motion.span>
  );
};