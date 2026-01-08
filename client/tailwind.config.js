/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#ffffff',
          50:  '#ffffff',
          100: '#ffffff',
          200: '#f0f0f0',
          300: '#cccccc',
        },
        espresso: {
          DEFAULT: '#000000',
          light:   '#000000',
          mid:     '#222222',
          muted:   '#555555',
        },
        terra: {
          DEFAULT: '#0044cc',
          light:   '#3366dd',
          dark:    '#002a99',
          50:      '#e6eeff',
          100:     '#cce0ff',
        },
        saffron: {
          DEFAULT: '#ffcc00',
          light:   '#ffd633',
          dark:    '#cc9900',
          50:      '#fff7e6',
        },
        sage: '#00aa00',
      },
      fontFamily: {
        sans:    ['"Times New Roman"', 'Times', 'serif'],
        serif:   ['"Times New Roman"', 'Times', 'serif'],
        mono:    ['"Times New Roman"', 'Times', 'serif'],
        heading: ['"Times New Roman"', 'Times', 'serif'],
        body:    ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'warm-xs': 'none',
        'warm-sm': 'none',
        'warm':    'none',
        'warm-lg': 'none',
        'terra':   'none',
        'terra-lg':'none',
        'inset':   'none',
      },
      animation: {
        'fade-in':  'none',
        'slide-up': 'none',
        'scale-in': 'none',
        'pulse-dot':'none',
      },
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        '4xl': '0',
        full: '0',
      },
    },
  },
  plugins: [],
};
