import { useState,useEffect } from "react";
export default function Getquotes(){
    const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Life is what happens when you're busy making other plans. - John Lennon",
        "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
        "In three words I can sum up everything I've learned about life: it goes on. - Robert Frost",
        "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
        "You only live once, but if you do it right, once is enough. - Mae West",
        "To live is the rarest thing in the world. Most people exist, that is all. - Oscar Wilde",
        "Do not go where the path may lead, go instead where there is no path and leave a trail. - Ralph Waldo Emerson",
        "Life isn’t about finding yourself. Life is about creating yourself. - George Bernard Shaw",
        "In the end, we will remember not the words of our enemies, but the silence of our friends. - Martin Luther King Jr."
      ];
    const [randomQuote, setRandomQuote] = useState('');

    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    };
  
    useEffect(() => {
      setRandomQuote(getRandomQuote());
    }, []); 

  return (
  <div className="p-3 sm:p-6 w-full font-poppins">
  <div className="relative group max-w-[85rem] text-white px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14 mx-auto backdrop-blur-sm bg-blue-950/40 opacity-90 bg-opacity-20 p-4 sm:p-8 rounded-lg shadow-lg hover:shadow-gray-800 shadow-gray-800/50 transition-shadow flex items-center justify-center overflow-hidden">
    
    {/* Shine Effect */}
    <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:blur-sm before:translate-x-[-100%] group-hover:before:translate-x-[200%] before:rotate-12 before:transition before:duration-1000 before:ease-in-out" />

    {/* Text Content */}
    <p className="relative z-10 text-lg sm:text-xl md:text-2xl lg:text-[30px] font-semibold leading-relaxed text-center">
      {randomQuote}
    </p>
  </div>
</div>


);
}
