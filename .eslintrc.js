module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript', // This is important for TS integration
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json', // Tells the resolver where to find your tsconfig
      },
    },
  },
  rules: {
    // You can add your project-specific rules here.
    // For example, to enforce alias usage:
    'import/no-relative-parent-imports': 'warn',
  },
  ignorePatterns: ['node_modules/', '.next/'],
};