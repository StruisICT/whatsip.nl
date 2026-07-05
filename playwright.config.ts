import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.TEST_URL || 'https://whatsip.nl';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Outside Cloudflare (wrangler pages dev) there is no CF-Connecting-IP;
    // inject one so the IP tools behave. Never sent to production.
    ...(baseURL.includes('localhost')
      ? { extraHTTPHeaders: { 'CF-Connecting-IP': '203.0.113.9' } }
      : {}),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
