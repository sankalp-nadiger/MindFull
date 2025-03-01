"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const HeroHighlight = ({
  children,
  className,
  containerClassName
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  
  // Feature hashtags to display
  const features = ["#ThinkToDo", "#MakeVision", "#AIEnabled"];
  
  // Angle values for the inclined hashtags (in degrees)
  const angles = [0, 0, 0];
  
  // Positions for the hashtags
  const positions = [
    "left-[20%] bottom-8 transform -translate-x-1/2",
    "left-1/2 bottom-8 transform -translate-x-1/2",
    "left-[80%] bottom-8 transform -translate-x-1/2"
  ];
  
  

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
      
      {/* Highlight effect */}
      <motion.div
        className="pointer-events-none bg-dot-thick-indigo-500 dark:bg-dot-thick-indigo-500 absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
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
      
      {/* Inclined hashtags positioned around the content */}
      {features.map((feature, index) => (
        <div 
          key={`feature-${index}`} 
          className={`absolute ${positions[index]} text-2xl font-bold text-indigo-600 dark:text-indigo-400 opacity-30 hover:opacity-100 transition-opacity duration-300 z-10`}
          style={{
            transform: `rotate(${angles[index]}deg)`,
            transformOrigin: 'center',
          }}
        >
          {feature}
        </div>
      ))}
      
      {/* Main content */}
      <div className={cn("relative z-20", className)}>{children}</div>
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