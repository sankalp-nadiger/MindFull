import React, {useEffect, useState} from 'react'


      const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => {
      const storedPreference = localStorage.getItem("darkMode");
      if (storedPreference !== null) {
        return storedPreference === "true";
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
      setDarkMode((prev) => !prev);
    };

    return [darkMode, toggleDarkMode];
  };
   

export default useDarkMode;
