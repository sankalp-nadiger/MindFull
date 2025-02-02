import React from "react";
import { BackgroundBeamsWithCollision } from "./BackgroundCollision";
import { useNavigate } from "react-router-dom";
export function BackgroundBeamsWithCollisionDemo() {
  
  const navigate = useNavigate();

  const handleclick = () => {
    navigate("/student-signin");
  };
  
  return (
    (<BackgroundBeamsWithCollision>
      <div className="flex-col align-middle justify-center">
      <img className=" mx-auto my-0 block w-40 h-40 " src="plant.png"></img>
      <h2
        className=" text-2xl relative z-20  md:text-5xl lg:text-8xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
        MindFull{" "}
        <div
          className="relative mx-auto block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div
            className="text-2xl md:text-5xl lg:text-6xl absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            <span className="">A Gamified Experience to Mental Wellness...</span>
          </div>
          <div
            className=" text-2xl md:text-5xl lg:text-6xl relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            <span className="">A Gamified Experience to Mental Wellness...</span>
          </div>
          <div style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:"20px"}}>
          <button type="button" onClick={handleclick}  class="w-50 h-10 px-4 tracking-wider inline-flex text-center items-center gap-x-2 text-lg font-medium rounded-lg border border-gray-500 text-gray-200 hover:border-blue-800 hover:bg-blue-500 hover:text-white focus:outline-none focus:border-blue-600 focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ">
  Get Started <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
</svg>
</button>

</div>
        </div>
      </h2>
      </div>
    </BackgroundBeamsWithCollision>)
  );
}
