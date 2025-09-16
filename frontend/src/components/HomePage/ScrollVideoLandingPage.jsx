import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

const ScrollVideoAnimation = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top center",
        end: "center center", 
        scrub: 1,
        onUpdate: (self) => {
         
          const isMobile = window.innerWidth < 640;
          const isTablet = window.innerWidth < 1024;
          
          let maxScale;
          if (isMobile) {
            maxScale = 1.5; 
          } else if (isTablet) {
            maxScale = 1.8; 
          } else {
            maxScale = 2.2;
          }
          
          const scale = 1 + (self.progress * (maxScale - 1));
          gsap.set(video, { scale: scale });
        },
        onComplete: () => {
          
          const isMobile = window.innerWidth < 640;
          const isTablet = window.innerWidth < 1024;
          
          let finalScale;
          if (isMobile) {
            finalScale = 1.5;
          } else if (isTablet) {
            finalScale = 1.8;
          } else {
            finalScale = 2.2;
          }
          
          gsap.set(video, { scale: finalScale });
        }
      }
    });

    return () => {
      
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="dark:bg-gray-900 bg-white">

      {/* Video container */}
      <div ref={containerRef} className="min-h-96  flex items-center justify-center py-60 px-4 overflow-hidden">
        <div className="relative max-w-full">
          <video
            ref={videoRef}
            className="w-64 h-36 sm:w-80 sm:h-48 md:w-96 md:h-56 lg:w-[500px] lg:h-80 rounded-xl border-4 border-green-500 shadow-md shadow-green-500/50 max-w-[70vw] max-h-[40vh] object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          
          <div className="absolute inset-0 rounded-xl  animate-pulse opacity-50 pointer-events-none"></div>
        </div>
      </div>

      
    </div>
  );
};

export default ScrollVideoAnimation;