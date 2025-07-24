/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        pastelRV: {
          "primary": "#a9c1d9",          // Soft, dusty blue
          "primary-content": "#2e353f",   // Dark text for readability
          "secondary": "#d1e1d4",        // Muted sage green
          "secondary-content": "#333c37", // Dark text for readability
          "accent": "#f2c7b6",           // Soft peach
          "accent-content": "#473025",    // Dark text for readability
          "neutral": "#f5f2e9",          // Warm, off-white (eggshell)
          "neutral-content": "#3d3b36",   // Dark text for readability
          "base-100": "#ffffff",         // Base page color (white)
          "base-200": "#f7f7f7",         // Slightly darker bg
          "base-300": "#ededed",         // Even darker bg
          "base-content": "#333333",      // Default text color

          "--rounded-box": "1rem",       // optional: larger corner radius
          "--rounded-btn": "0.5rem",     // optional: softer button corners
        },
      },
      "light", 
      "dark", 
      "cupcake"
    ],
  },
};