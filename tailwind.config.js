/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#1A2332',
        surfaceHighlight: '#232D3F',
        primary: '#6366F1',
        primaryHover: '#4F46E5',
        accent: '#8B5CF6',
        secondary: '#64748B',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B'
      }
    },
  },
  plugins: [],
}
