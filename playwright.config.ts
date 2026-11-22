import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
    {
      name: 'chromium-dpr-1.5',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1.5 },
      testMatch: /.*hero\.spec\.ts/,
    },
    {
      name: 'chromium-dpr-2',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 2 },
      testMatch: /.*hero\.spec\.ts/,
    },
    {
      name: 'chromium-low-power',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 1,
      },
      testMatch: /.*hero\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
