module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended' // Integrates Prettier with ESLint
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prettier/prettier': 'error', // Make prettier errors show as ESLint errors
    'react/prop-types': 'off', // Disable prop-types rule, as you use TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off' // Adjust rules for your coding style
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};