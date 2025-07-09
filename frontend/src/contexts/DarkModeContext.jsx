// contexts/DarkModeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';


const DarkModeContext = createContext();

// Provider component
export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if we're in the browser (not during SSR)
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem("darkMode");
      if (storedPreference !== null) {
        return storedPreference === "true";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false; // Default for SSR
  });

  useEffect(() => {
    // Apply the theme to the document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    setDarkMode // In case you want to set it directly
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};


export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  
  return context;
};