import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: !isCI, // Sequential in CI for stability
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html', // GitHub annotations in CI
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only test Chrome in CI for speed, test all locally
    ...(isCI ? [] : [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ]),
  ],
  // Only start web server if testing locally and not providing external URL
  ...(!process.env['PLAYWRIGHT_BASE_URL'] ? {
    webServer: {
      command: 'npm run start',
      url: 'http://localhost:4200',
      reuseExistingServer: !isCI,
      timeout: 120000,
    },
  } : {}),
});
