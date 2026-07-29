import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        donezo: {
          bg: '#F3F5F4',
          surface: '#FFFFFF',
          dark: '#52b788',
          'dark-hover': '#40916c',
          green: '#52b788',
          'light-green': '#d8f3dc',
          border: '#E2E8E4',
          text: '#13221C',
          muted: '#687870'
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};

export default config;
