import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  Bot,
  HeartHandshake,
  UsersRound,
  BrainCircuit,
  Video,
  PencilRuler,
  X,
  Menu,
  User,
  HelpCircle,
  Eye,
  Gamepad2,
  Brain,
  Trophy,
  Users,
  Moon,
  Sun,
} from "lucide-react";

function FeatureCard({ icon, title, description }) {
  
  return (
    <div className="bg-green-200  dark:bg-gray-700 p-8 rounded-2xl shadow hover:shadow-lg transition duration-300 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-primaryblue dark:text-blue-400  mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-50 text-base">{description}</p>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const journeySteps = [
    {
      id: 1,
      title: "Login/Signup",
      subtitle: "Get Started",
      icon: User,
      bgColor: "bg-blue-500",
      position: { top: "50%", left: "8%" },
    },
    {
      id: 2,
      title: "Onboarding",
      subtitle: "Tell Us About You",
      icon: HelpCircle,
      bgColor: "bg-emerald-500",
      position: { top: "50%", left: "22%" },
    },
    {
      id: 3,
      title: "Personalized Content",
      subtitle: "Your Dashboard",
      icon: Eye,
      bgColor: "bg-purple-500",
      position: { top: "50%", left: "36%" },
    },
    {
      id: 4,
      title: "Daily Activities",
      subtitle: "Fun Challenges",
      icon: Gamepad2,
      bgColor: "bg-orange-500",
      position: { top: "50%", left: "50%" },
    },
    {
      id: 5,
      title: "Meditation",
      subtitle: "Mindfulness",
      icon: Brain,
      bgColor: "bg-pink-500",
      position: { top: "50%", left: "64%" },
    },
    {
      id: 6,
      title: "Badges & Streaks",
      subtitle: "Achievements",
      icon: Trophy,
      bgColor: "bg-yellow-500",
      position: { top: "50%", left: "78%" },
    },
    {
      id: 7,
      title: "Join Communities",
      subtitle: "Connect & Share",
      icon: Users,
      bgColor: "bg-teal-500",
      position: { top: "50%", left: "92%" },
    },
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

 const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <>
      <div className="min-h-screen font-poppins  bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-32 h-32 bg-green-300 rounded-full opacity-7 top-1/3 left-1/4 animate-ping"
            style={{ animationDuration: "2s" }}
          ></div>
        </div>

        <div className="relative z-10  ">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-6  bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center space-x-4">
              <img
                src="/plant.png"
                className="w-auto lg:h-16 h-10"
                alt="Logo"
              />
              <h2 className="text-xl font-bold text-green-900 dark:text-green-400">
                MindFull
              </h2>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex space-x-8 items-center">
              <a
                href="#"
                className="text-gray-800 dark:text-gray-200 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                About
              </a>
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Features
              </a>
              <a
                href="#journey"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Journey
              </a>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
             
            </nav>

            <button onClick={() =>navigate('/signin')} className="hidden lg:block bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-lg">
               SignUp / SignIn
            </button>

            {/* Mobile section */}
            <div className="lg:hidden flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <button
                className="text-green-900 dark:text-green-400"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={28} />
              </button>
            </div>
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 z-40"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 z-50 shadow-lg transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400">
                  Menu
                </h3>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4 p-6">
                <a
                  href="/"
                  className="text-gray-800 dark:text-gray-200 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  About
                </a>
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#journey"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Journey
                </a>
                
                <button onClick={() =>navigate('/signin')} className="mt-4 bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-lg">
                  Sign Up
                </button>
              </nav>
            </div>
          </header>

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-center dark:bg-gray-900  ">
            <div className="flex-1 lg:pr-12 mb-8 lg:ml-24   lg:mb-16">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-6">
                Your one stop
                <br />
                Solution for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
                  Mental Fitness
                </span>
              </h1>

              <p className="text-gray-600 text-lg mb-8 max-w-lg leading-relaxed">
                Make sure your daily nutrition is sufficient. Consult your
                problem about nutrition with us and live a healthier lifestyle.
              </p>
            
              
             
              <div className="flex flex-wrap sm:justify-center gap-2 sm:gap-3 px-2 sm:px-0">
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-700 dark:border-gray-800 dark:text-white backdrop-blur-sm text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200 hover:border-green-300 transition-colors shadow-sm">
                  Mental Wellness
                </span>
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-700 dark:border-gray-800 dark:text-white backdrop-blur-sm text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                  Personalised Content
                </span>
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-700 dark:border-gray-800 dark:text-white backdrop-blur-sm text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200 hover:border-green-300 transition-colors shadow-sm">
                  Consultation
                </span>
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-700 dark:border-gray-800 dark:text-white backdrop-blur-sm text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                  Fun games and Activities
                </span>
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 dark:bg-gray-700 dark:border-gray-800 dark:text-white backdrop-blur-sm text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200 hover:border-green-300 transition-colors shadow-sm">
                  Peer Network
                </span>
              </div>
            </div>
            <div className="flex-1 px-4 sm:px-8 lg:pl-2 mt-10 hidden lg:block lg:mt-0 md:mb-44">
              <div className="w-full h-auto flex items-center justify-center relative">
                <img
                  src={darkMode ? "/hea3.png" : "/hea.png"}
                  alt="Health Illustration"
                  className="w-3/4 sm:w-2/3 md:w-[300px] lg:w-[400px] xl:w-[500px] h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <section id="about" className="scroll-smooth relative bg-white dark:bg-gray-900 px-6 lg:px-24 font-poppins">
        <div
          className="absolute w-40 h-40 bg-green-300 rounded-full opacity-7 right-1 animate-pulse"
          style={{ animationDuration: "2s" }}
        ></div>
        <div
          className="absolute w-32 h-32 bg-green-300 rounded-full opacity-7 -bottom-4 right-48 animate-ping"
          style={{ animationDuration: "2s" }}
        ></div>

        <div  className="max-w-6xl mx-auto flex flex-col lg:flex-row  gap-10 ">
          <div className="w-1/2 lg:w-1/2 ">
            <img
              src={darkMode ? "/hea5.png" : "/hea4.png"}
              alt="Mindful support illustration"
              className="w-full h-auto items-center  object-cover"
            />
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 lg:mt-14 lg:pr-9">
            <h2 className="text-3xl lg:text-4xl font-bold text-primarygreen mb-4">
              For You,<span className="text-primaryblue"> With You</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-50 text-xl leading-relaxed mb-6">
              At <span className="font-semibold text-primary">Mindfull</span>,
              we believe mental well-being is a journey, and no one should walk
              it alone. Whether you're navigating stress, seeking peace, or
              simply want to feel heard — we're here with support that listens,
              tools that guide, and a community that understands.
            </p>
            <p className="text-gray-600 dark:text-gray-50 text-xl leading-relaxed">
              From quiet reflections to daily wins, every moment matters. And
              through it all, we're with you — supportive, present, and just a
              click away.
            </p>
          </div>
        </div>
      </section>
      <section id="features" className="bg-white dark:bg-gray-900   font-poppins ">
        <div className="  ">
      
      <div
        id="mind"
        className=" py-10 text-center mb-12 px-36 relative dark:bg-gray-900  "
      >
        <div
          className="absolute w-24 h-24 bg-green-300 rounded-full opacity-7 -top-10 -left-24 animate-pulse"
          style={{ animationDuration: "2s" }}
        ></div>
        <h2 className="text-4xl lg:text-6xl font-bold text-primarygreen mb-4 relative z-10 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
          How It Works
        </h2>
        <p className="text-primaryblue text-lg font-semibold max-w-2xl mx-auto relative z-10 bg-white/15 dark:bg-black/20 dark:brightness-75 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
          Discover how Mindfull helps you create a calm, guided, and
          personalized wellness experience — at your pace, in your way.
        </p>
      </div>

      

      
    </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 px-10 lg:px-0 lg:pb-14 max-w-6xl mx-auto ">
          <FeatureCard
            icon={<Bot className="w-10 h-10 mx-auto text-yellow-500" />}
            title="MindFull Bot"
            description="24/7 AI-powered assistant offering personalized mental health guidance, calming exercises, and instant support."
          />

          <FeatureCard
            icon={
              <HeartHandshake className="w-10 h-10 mx-auto text-blue-600" />
            }
            title="Peer Community"
            description="Join safe, anonymous peer groups. Share experiences, ask for advice, and connect through moderated spaces."
          />

          <FeatureCard
            icon={<UsersRound className="w-10 h-10 mx-auto text-red-400" />}
            title="Talk to Experts"
            description="Access professional counseling anonymously. Book sessions, ask questions, or explore crisis support options."
          />

          <FeatureCard
            icon={<BrainCircuit className="w-10 h-10 mx-auto text-green-500" />}
            title="Guided Activities & Meditation"
            description="Relax your mind with daily wellness activities, breathing sessions, and guided meditations tailored to your mood."
          />

          <FeatureCard
            icon={<Video className="w-10 h-10 mx-auto text-indigo-500" />}
            title="Smart Content Delivery"
            description="Enjoy curated videos, mental health guides, and educational materials that adapt to your interests and engagement."
          />

          <FeatureCard
            icon={<PencilRuler className="w-10 h-10 mx-auto text-pink-500" />}
            title="Virtual Boards"
            description="Draw, doodle, and brainstorm freely on virtual boards. Map your thoughts and reflect creatively through visuals."
          />
        </div>
      </section>
      <div id="journey" className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-14 ">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900  flex flex-col sm:flex-row items-center justify-between">
  {/* Left Content */}
  <div className="sm:w-1/2 text-left  sm:mb-0">
    <h1 className="text-4xl sm:text-6xl font-bold text-primarygreen mb-4">
      Your Wellness Journey
    </h1>
    <p className="text-primaryblue text-lg font-semibold">
      Follow the path to transform your wellness experience
    </p>
  </div>

  {/* Right Image */}
  <div className="sm:w-1/2 flex justify-center">
    <img
      src={darkMode ? "/hea8.png" : "/hea7.png"}
      alt="Wellness Journey"
      className="max-w-full h-auto "
    />
  </div>
</div>


        {/* Desktop Journey Map */}
        <div className="hidden lg:block relative">
          <div className="relative h-80 max-w-5xl mx-auto">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              const nextStep = journeySteps[index + 1];

              return (
                <div key={step.id}>
                  {nextStep && (
                    <div
                      className="absolute z-0"
                      style={{
                        top: step.position.top,
                        left: step.position.left,
                        width: `${
                          parseFloat(nextStep.position.left) -
                          parseFloat(step.position.left)
                        }%`,
                        height: `${
                          parseFloat(nextStep.position.top) -
                          parseFloat(step.position.top)
                        }%`,
                        transformOrigin: "0 0",
                      }}
                    >
                      <div
                        className="absolute w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 opacity-60"
                        style={{
                          transform: `rotate(${
                            (Math.atan2(
                              parseFloat(nextStep.position.top) -
                                parseFloat(step.position.top),
                              parseFloat(nextStep.position.left) -
                                parseFloat(step.position.left)
                            ) *
                              180) /
                            Math.PI
                          }deg)`,
                          transformOrigin: "0 0",
                        }}
                      />
                    </div>
                  )}

                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{
                      top: step.position.top,
                      left: step.position.left,
                    }}
                  >
                    <div
                      className={`
                    w-24 h-24 ${step.bgColor} rounded-full flex items-center justify-center 
                    shadow-lg border-4 border-white relative
                    transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl
                  `}
                    >
                      <IconComponent size={28} className="text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
                        <span className="text-gray-700 font-bold text-xs">
                          {step.id}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`
                    absolute -top-28 left-1/2 transform -translate-x-1/2 
                    bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-44 dark:bg-gray-800 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-20
                  `}
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-gray-800 dark:text-gray-50 text-sm mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-blue-400 text-xs">
                          {step.subtitle}
                        </p>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-2"></div>
                      </div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden max-w-md mx-auto">
          <div className="relative">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl">
                    <div
                      className={`
                    w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center 
                    shadow-md border-4 border-white relative flex-shrink-0
                  `}
                    >
                      <IconComponent size={24} className="text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
                        <span className="text-gray-700 font-bold text-xs">
                          {step.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{step.subtitle}</p>
                    </div>
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className="flex justify-center py-3">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 text-center font-poppins">
          <div className="bg-white dark:bg-blue-950 p-6 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-blue-50 mb-3 ">
              🌟 Start Your Transformation Today
            </h3>
            <p className="text-gray-600 dark:text-blue-300 leading-relaxed">
              Each step in this journey is designed to build upon the previous
              one, creating a comprehensive wellness experience that grows with
              you. Hover over each step to learn more!
            </p>
          </div>
        </div>
      </div>

      <footer className=" border-t border-gray-200 bg-[url('/hea6.jpg')] bg-cover bg-center min-h-screen
             relative dark:brightness-75  font-poppins">
        <div className="max-w-7xl mx-auto px-6 py-16 ">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900  mb-6">
                JOIN THE
                <br />
                MINDFULL
                <br />
                MOVEMENT
              </h2>

              <div className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="EMAIL"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                    OK
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900  mb-6">
                HELP
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-700  hover:text-blue-600 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700  hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900  mb-6">
                  LEGAL INFO
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-blue-600 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-blue-600 transition-colors"
                    >
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-blue-600 transition-colors"
                    >
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-blue-600 transition-colors"
                    >
                      Gift Card
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  FOLLOW US
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-green-600 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-green-600 transition-colors"
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-green-600 transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-700  hover:text-green-600 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 py-12 overflow-hidden">
          <div className="relative">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mx-8">
                MINDFULL
              </span>
              <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mx-8">
                MINDFULL
              </span>
              <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mx-8">
                MINDFULL
              </span>
              <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mx-8">
                MINDFULL
              </span>
              <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mx-8">
                MINDFULL
              </span>
            </div>
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .animate-marquee {
              animation: marquee 15s linear infinite;
              display: inline-block;
            }
          `}</style>
        </div>
        <div className="bg-gray-900 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">
                  HUMAN • WELLNESS • MINDFULL
                </span>
              </div>

              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm">
                  © 2025 Mindfull - All Rights Reserved
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
