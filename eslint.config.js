import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['test/**/*.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // page.evaluate() のコールバックはブラウザで動きます。
    files: ['e2e/**/*.spec.js'],
    languageOptions: { globals: globals.browser },
  },
];
