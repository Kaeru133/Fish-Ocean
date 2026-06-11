/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: '#030712',      // Very deep dark blue/black background
          abyss: '#080E1A',     // Deep dark navy blue cards/sections
          navy: '#0F1A2D',      // Mid-tone navy blue for borders/hover
          cyan: '#00F0FF',      // Glowing data highlights, stable states
          alert: '#FF4D4D',     // Threat/crisis indicator color
          coral: '#FF6B4A',     // Warning accent
          gov: '#3B82F6',       // Public sector theme blue
          private: '#10B981',   // Private sector theme green
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s infinite alternate',
        'glow-alert': 'glowAlert 2s infinite alternate',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2), 0 0 10px rgba(0, 240, 255, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.6), 0 0 30px rgba(0, 240, 255, 0.3)' }
        },
        glowAlert: {
          '0%': { boxShadow: '0 0 5px rgba(255, 77, 77, 0.2), 0 0 10px rgba(255, 77, 77, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(255, 77, 77, 0.6), 0 0 30px rgba(255, 77, 77, 0.3)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
