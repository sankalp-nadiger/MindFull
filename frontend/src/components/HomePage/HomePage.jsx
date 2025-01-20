import React from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom
import { BackgroundBeamsWithCollisionDemo } from './hero';  // Assuming you have this component
import Footer from "../Footer/Footer";  // Assuming you have the Footer component
import Contactus from "./Contact";  // Assuming you have a Contact component

function HomePage() {
  const navigate = useNavigate();  // Initialize navigate function

  const handleGetStartedClick = () => {
    navigate('/student-signup');  // Navigate to the /signup page
  };

  return (
    <>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl">Tailblocks</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a className="mr-5 hover:text-gray-900">First Link</a>
            <a className="mr-5 hover:text-gray-900">Second Link</a>
            <a className="mr-5 hover:text-gray-900">Third Link</a>
            <a className="mr-5 hover:text-gray-900">Fourth Link</a>
          </nav>
          <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0" onClick={handleGetStartedClick}>
            Get Started
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </header>

      <BackgroundBeamsWithCollisionDemo />  {/* Hero Section */}
      
      <div className="overflow-hidden bg-gradient-to-b from-purple-500 via-purple-950 to-black">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative mx-auto max-w-4xl grid space-y-5 sm:space-y-10">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3 dark:text-neutral-200">
                Small business solutions
              </p>
              <h1 className="text-3xl text-gray-800 font-bold sm:text-5xl lg:text-6xl lg:leading-tight dark:text-neutral-200">
                Turn online shoppers into <span className="text-blue-500">lifetime customers</span>
              </h1>
            </div>
            
            <div className="sm:flex sm:justify-center sm:items-center text-center sm:text-start">
              <div className="shrink-0 pb-5 sm:flex sm:pb-0 sm:pe-5">
                <div className="flex justify-center -space-x-3">
                  <img className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="Avatar" />
                  <img className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="Avatar" />
                  <img className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&&auto=format&fit=facearea&facepad=3&w=300&h=300&q=80" alt="Avatar" />
                  <img className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="Avatar" />
                  <span className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-white bg-gray-800 dark:bg-neutral-900 dark:ring-neutral-900">
                    <span className="text-xs font-medium leading-none text-white uppercase">7k+</span>
                  </span>
                </div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-s border-gray-200 w-32 h-px sm:w-auto sm:h-full mx-auto sm:mx-0 dark:border-neutral-700"></div>

              <div className="pt-5 sm:pt-0 sm:ps-5">
                <div className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Trust pilot</div>
                <div className="text-sm text-gray-500 dark:text-neutral-500">Rated best over 37k reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Contactus />  {/* Contact Section */}
      <Footer />  {/* Footer Section */}
    </>
  );
}

export default HomePage;
