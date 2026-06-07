/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberBg: '#040806',
        cyberBg2: '#060d08',
        cyberGreen: '#22c55e',
        cyberGreenLight: '#4ade80',
        t1: 'rgba(220, 255, 220, 0.9)',
        t2: 'rgba(220, 255, 220, 0.45)',
        t3: 'rgba(220, 255, 220, 0.22)',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'Sora', 'Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        cyber: '-0.045em',
      },
      lineHeight: {
        cyber: '0.9',
      }
    },
  },
  plugins: [],
}
