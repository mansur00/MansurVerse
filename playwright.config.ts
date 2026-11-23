import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:4321';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
  ],
};

if (!process.env.BASE_URL) {
  config.webServer = {
    command: 'pnpm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  };
}

export default defineConfig(config);
