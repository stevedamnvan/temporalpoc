module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: 'rgba(255,255,255,0.04)',
        'surface-alt': 'rgba(255,255,255,0.06)',
        'text-primary': '#ffffff',
        'text-accent': '#36c1b3',
        'text-warning': '#ee8068',
      },
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
