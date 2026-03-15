export const themes = {
  neutral: {
    '--bg-primary': '#FCF9F5',
    '--accent-solid': '#C17B5E',
    '--accent-gradient': 'linear-gradient(135deg, #C17B5E, #B46F52)',
    '--card-bg': '#FFFFFF',
    '--text-primary': '#2C2C2C',
    '--text-secondary': '#6B6B6B',
    '--border-light': '#E8E8E8',
    '--icon-heart': '🤍',
  },
  lgbtq: {
    '--bg-primary': '#FCF9F5',
    '--accent-solid': '#FF6B6B', /* Using solid color fallback for native compatibility if gradient fails */
    '--accent-gradient': 'linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B6B9B)',
    '--card-bg': '#FFFFFF',
    '--text-primary': '#2C2C2C',
    '--text-secondary': '#6B6B6B',
    '--border-light': '#E8E8E8',
    '--icon-heart': '🏳️‍🌈',
  }
};
