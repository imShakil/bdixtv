/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#102134',
        steel: '#385170',
        sea: '#4fa3a5',
        sand: '#f4efe8',
        ember: '#ff7f50'
      },
      boxShadow: {
        card: '0 15px 35px -20px rgba(16, 33, 52, 0.45)'
      }
    }
  },
  plugins: []
};
