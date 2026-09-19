import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  ...(process.env.CI ? { workers: 1 } : {}),

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:3000',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',
  },

  webServer: {
    command: 'pnpm --dir fixtures/next-app dev',

    url: 'http://localhost:3000',

    reuseExistingServer: !process.env.CI,

    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
