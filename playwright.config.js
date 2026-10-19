import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    permissions: ['camera'],
    launchOptions: {
      // Chromium の fake camera を使う。本物のカメラでの動作は保証しない。
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    },
  },
  webServer: {
    command: 'node e2e/server.js',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
});
