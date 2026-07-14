import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.TEST_URL || 'https://whatsip.nl';

// visual.spec.ts only runs in the dedicated `visual` project — its baselines
// are Linux/Chromium-only (generated on CI), so it must not leak into the
// cross-browser projects.
const visualSpec = /visual\.spec\.ts/;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  expect: {
    // Small allowance for anti-aliasing drift between Chromium builds
    toHaveScreenshot: { maxDiffPixels: 100 },
  },

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
      testIgnore: visualSpec,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: visualSpec,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: visualSpec,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: visualSpec,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: visualSpec,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: visualSpec,
    },
  ],
});
