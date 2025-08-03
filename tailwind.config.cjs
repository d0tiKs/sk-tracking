module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1a',
        surface: '#121a2a',
        accent: '#3a86ff',
        text: '#e6e9ef',
        ok: '#3ddc97',
        bad: '#ef476f',
        whiteA: {
          2: 'rgba(255,255,255,0.02)',
          5: 'rgba(255,255,255,0.05)'
        }
      }
    }
  },
  plugins: []
};