// Flat ESLint config with no plugin dependencies, so `npm install` is enough.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  IntersectionObserver: 'readonly',
  ResizeObserver: 'readonly',
  AudioContext: 'readonly',
  Image: 'readonly',
  URL: 'readonly',
  console: 'readonly',
  history: 'readonly',
  location: 'readonly',
  performance: 'readonly',
  HTMLElement: 'readonly',
  Element: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

const sharedRules = {
  'no-undef': 'error',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'no-console': 'error',
  'no-debugger': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-imports': 'error',
  'no-unreachable': 'error',
  'eqeqeq': ['error', 'always'],
  'prefer-const': 'error',
  'no-var': 'error',
};

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: browserGlobals,
    },
    rules: sharedRules,
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: { ...sharedRules, 'no-console': 'off' },
  },
];
