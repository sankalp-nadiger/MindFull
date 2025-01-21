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

    return(
        <div className="shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)] transition duration-300 p-6  bg-black w-full   ">
<div className="max-w-[85rem] text-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-lg bg-gray-900 bg-opacity-70 p-8 rounded-lg shadow-lg shadow-red-500/50 hover:shadow-blue-500/50 transition-shadow flex align-middle justify-center">
    <p className="text-[30px] font-semibold leading-relaxed">{randomQuote}</p>
  </div>

    </div>
    )
}
