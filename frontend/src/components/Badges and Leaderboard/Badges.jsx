import React, { useEffect, useState } from "react";

// Mock data for badges
const badgesData = [
  { id: 1, name: "Beginner", scoreThreshold: 10, isLocked: false, isDailyLogin: false,img:"./Bronze.png" },
  { id: 2, name: "Intermediate", scoreThreshold: 30, isLocked: false, isDailyLogin: false,img:"./Pink and Blue Badge Logo.png" },
  { id: 3, name: "Advanced", scoreThreshold: 90, isLocked: false, isDailyLogin: false,img:"./Red and Blue Badge Logo.png" },
];

// Mock fetch function to get student data
const fetchStudentData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        score: 75, // Example score from backend
        lastLogin: new Date().toISOString(), // Example last login date
      });
    }, 1000);
  });
};

const BadgesCorner = () => {
  const [studentData, setStudentData] = useState({ score: 0, lastLogin: null });
  const [badges, setBadges] = useState(badgesData);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Fetch student data from backend
    fetchStudentData().then((data) => {
      setStudentData(data);
      updateBadges(data);
    });
  }, []);

  // Update badges based on student data
  const updateBadges = (data) => {
    const updatedBadges = badges.map((badge) => {
      if (!badge.isLocked) {
        if (badge.isDailyLogin) {
         
          const lastLoginDate = new Date(data.lastLogin).toDateString();
          const todayDate = new Date().toDateString();
          if (lastLoginDate === todayDate) {
            return { ...badge, isLocked: false };
          }
        } else if (data.score >= badge.scoreThreshold) {
          return { ...badge, isLocked: false };
        }
      }
      return badge;
    });
    setBadges(updatedBadges);
  };

  // Toggle dark theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className="min-h-screenbg-gray-900 text-black">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-white font-bold">Badges Corner</h1>
        </div>
        <div className="grid grid-cols-1 w-[1600px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-6 rounded-lg shadow-lg ${
                badge.isLocked ? "bg-gray-400" : "bg-white"
              }`}
            >
                { badge.img ? <img src={`${badge.img}`} className="w-[80px] h-[80px]"></img> :<img src="./images.png" className="w-[40px] h-[40px]"></img> }
              <h2 className={`text-xl font-semibold ${badge.isLocked ? "text-gray-600" : ""}`}>
                {badge.name}
              </h2>
              <p className={`mt-2 ${badge.isLocked ? "text-gray-500" : ""}`}>
                {badge.isLocked
                  ? "Locked"
                  : badge.isDailyLogin
                  ? "Earned for daily login"
                  : `Earned for scoring above ${badge.scoreThreshold}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesCorner;