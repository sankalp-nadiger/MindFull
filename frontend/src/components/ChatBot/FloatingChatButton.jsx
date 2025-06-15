import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bot, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  // Stop pulsing after user interacts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000); // Stop pulsing after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm whitespace-nowrap shadow-xl transform transition-all duration-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>Need someone to talk to?</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">Chat with MindFull Bot - Your mental wellness companion</div>
          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {/* Main Button */}
      <Link 
        to="/Chatbot"
        className="relative"
        onMouseEnter={() => {
          setIsHovered(true);
          setIsPulsing(false);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPulsing(false)}
      >
        <div className="relative">
          {/* Large animated ring for attention */}
          {isPulsing && (
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-ping opacity-30"></div>
          )}
          
          {/* Medium animated ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full animate-pulse opacity-40"></div>
          
          {/* Button */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 flex items-center justify-center group-hover:rotate-12 cursor-pointer">
            <Bot className="w-7 h-7 text-white animate-pulse" />
          </div>
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          
          {/* Heart particles for extra appeal */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-2 -left-2 text-pink-400 opacity-60 animate-float">💙</div>
            <div className="absolute -bottom-2 -right-2 text-purple-400 opacity-60 animate-float-delayed">✨</div>
          </div>
        </div>
      </Link>
      
      {/* Message indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-1 shadow-lg border">
        <div className="text-xs text-gray-600 font-medium">I'm here to help! 💚</div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

export default FloatingChatButton;
