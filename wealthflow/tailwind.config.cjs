module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
