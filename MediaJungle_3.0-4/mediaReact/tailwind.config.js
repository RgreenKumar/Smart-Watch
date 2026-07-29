/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // we start to customize colors and fonts
  theme: {
  extend: {
    height:{
header:'560px',
rate:'440px'
    },
    fontSize:{
h1:'2.6rem',
    },
    screens:{
      xs:'475px',
    },
  colors: {
    main:  '#141334',      // Dark Slate Gray
    subMain: '#DF9704',   // Pumpkin
    dry: '#2A2950',       // Battleship Gray
    star: '#FFD700',      // Gold
    text: '#C0C0C0',      // Silver
    border: '#585858',    // Dim Gray
    dryGray: '#E8E8E8',   // Light Gray
    'custom-color': '#2B2A52',
    'new':'#C2272D',
    'body_color':'#09080E',
    'bgl':'#232224',
    'cool':"#201E2A",
    "hard":"#101016"
  },
  backgroundImage: {
    'main-gradient': 'linear-gradient(to bottom, #141334, #0e0d25)',
  },
  },
  },
  plugins: [require('@tailwindcss/line-clamp')],
  };