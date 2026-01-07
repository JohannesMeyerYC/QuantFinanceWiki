export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  safelist: [
    'text-emerald-400',
    'text-teal-400',
    'text-purple-400',
    'text-blue-400',
    'text-amber-400',
    'bg-emerald-500',
    'bg-teal-500',
  ],
}