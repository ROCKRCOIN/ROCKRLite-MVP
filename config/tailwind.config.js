/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./ROCKRLite-Core/**/*.{js,ts,jsx,tsx,mdx}",
    "./ROCKRLite-Experience/**/*.{js,ts,jsx,tsx,mdx}",
    "./ROCKRLite-Domain/**/*.{js,ts,jsx,tsx,mdx}",
    "./ROCKRLite-Transaction/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      height: {
        '10': '40px', // Our standard component height
      },
      spacing: {
        '10': '40px', // Consistent spacing
      }
    }
  },
  plugins: []
}
