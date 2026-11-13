import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    permissions: ['camera'],
    launchOptions: {
      // Chromium の fake camera を使います。本物のカメラでの動作は別途確認が必要です。
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    },
  },
  webServer: {
    command: 'node e2e/server.ts',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
});
