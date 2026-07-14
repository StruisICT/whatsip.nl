import { test, expect, type Page } from '@playwright/test';

// Fields whose values change run-to-run and must not affect the diff.
// Home page: latency is measured live, and the colo line, ISP, location,
// timezone, and VPN hint all follow the runner's real egress IP — GitHub
// runners land in different Azure regions per run.
// Browser page: the GPU renderer string depends on the runner image.
const homeMask = (page: Page) => [
  page.locator('#family'),
  ...['latency', 'isp', 'location', 'timezone', 'vpnhint'].map((f) =>
    page.locator(`[data-field="${f}"] .v`),
  ),
];
const browserMask = (page: Page) => [
  page.locator('.field', { has: page.locator('.k', { hasText: 'GPU' }) }).locator('.v'),
];

test.describe('Visual regression tests', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });
  
  test('homepage (English) - light theme', async ({ page }) => {
    await page.goto('/en/');
    
    // Wait for IP to load to ensure consistent screenshot
    await expect(page.locator('#ip')).not.toHaveText('…', { timeout: 5000 });
    
    // Set light theme explicitly
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    
    await expect(page).toHaveScreenshot('home-en-light.png', { mask: homeMask(page) });
  });
  
  test('homepage (English) - dark theme', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#ip')).not.toHaveText('…');
    
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    await expect(page).toHaveScreenshot('home-en-dark.png', { mask: homeMask(page) });
  });
  
  test('homepage (Dutch)', async ({ page }) => {
    await page.goto('/nl/');
    await expect(page.locator('#ip')).not.toHaveText('…');
    await expect(page).toHaveScreenshot('home-nl.png', { mask: homeMask(page) });
  });
  
  test('browser page', async ({ page }) => {
    await page.goto('/en/browser');
    
    // Wait for grid to populate
    await expect(page.locator('#grid .field').first()).toBeVisible({ timeout: 3000 });
    
    await expect(page).toHaveScreenshot('browser.png', { mask: browserMask(page) });
  });
  
  test('headers page', async ({ page }) => {
    await page.goto('/en/headers');
    
    // Wait for headers to load
    await expect(page.locator('#grid .field').first()).toBeVisible({ timeout: 3000 });
    
    await expect(page).toHaveScreenshot('headers.png');
  });
  
  test('WebRTC page', async ({ page }) => {
    await page.goto('/en/webrtc');
    
    // Wait for the check to finish (status gets an ok/warn class when done);
    // mask the detected addresses — candidate IPs/ports vary per run
    await expect(page.locator('#status')).toHaveClass(/status-(ok|warn)/, { timeout: 10000 });

    await expect(page).toHaveScreenshot('webrtc.png', { mask: [page.locator('#grid .v')] });
  });
  
  test('IPv6 page', async ({ page }) => {
    await page.goto('/en/ipv6');
    
    // Wait for detection
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('ipv6.png');
  });
  
  test('privacy page', async ({ page }) => {
    await page.goto('/en/privacy');
    await expect(page).toHaveScreenshot('privacy.png');
  });
  
  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/');
    await expect(page.locator('#ip')).not.toHaveText('…');
    
    await expect(page).toHaveScreenshot('home-mobile.png', { mask: homeMask(page) });
  });
  
  test('tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en/browser');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('browser-tablet.png', { mask: browserMask(page) });
  });
});
