import svgToDataUri from "mini-svg-data-uri";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",],
    theme: {
      extend: {
        skew: {
          '-10': '-10deg', // Skew left for the current user
          '10': '10deg',   // Skew right for other users
        },
        fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
       colors: {
        primaryblue: '#453cf0',      
        primarygreen: '#00bf63',    
      },
        animation: {
        shine: 'shine 1.5s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      },
    },
    darkMode: 'class',
  plugins: [
      addVariablesForColors,
      function ({
        matchUtilities,
        theme
      }) {
        matchUtilities({
          "bg-dot-thick": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
            )}")`,
          }),
        }, { values: flattenColorPalette(theme("backgroundColor")), type: "color" });
      },
    ],
  };
  
  // This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
  function addVariablesForColors({
    addBase,
    theme
  }) {
    let allColors = flattenColorPalette(theme("colors"));
    let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));
  
    addBase({
      ":root": newVars,
    });
  }
  

