import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  // src/*.js は npm run build で src/*.ts から出力したものです。
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'src/**/*.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['test/**/*.ts', 'e2e/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // page.evaluate() のコールバックはブラウザで動きます。
    files: ['e2e/**/*.spec.ts'],
    languageOptions: { globals: globals.browser },
  },
];
