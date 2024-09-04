const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind')
const { join } = require('path')

module.exports = {
  content: [
    join(__dirname, '../../libs/apps/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/component-angular/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/story-angular/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/formly/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname)
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bluegray: {
          50: '#ECEFF1',
          100: '#CFD8DC',
          200: '#B0BEC5',
          300: '#90A4AE',
          400: '#78909C',
          500: '#607D8B',
          600: '#546E7A',
          700: '#455A64',
          800: '#37474F',
          900: '#263238'
        },
        'token-main-surface-primary': 'var(--main-surface-primary)',
        'token-main-surface-secondary': 'var(--main-surface-secondary)',
        'token-text-secondary': 'var(--text-secondary)',
        'token-border-medium': 'var(--border-medium)',
      }
    },
    fontFamily: {
      notoColorEmoji: "'Noto Color Emoji', sans-serif;"
    }
  },
  variants: {
    extend: {
      backgroundColor: ['disabled'],
      textColor: ['disabled'],
    },
  },
  plugins: []
}
