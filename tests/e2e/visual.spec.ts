import { test, expect } from '@playwright/test';

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
    
    await expect(page).toHaveScreenshot('home-en-light.png');
  });
  
  test('homepage (English) - dark theme', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#ip')).not.toHaveText('…');
    
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    await expect(page).toHaveScreenshot('home-en-dark.png');
  });
  
  test('homepage (Dutch)', async ({ page }) => {
    await page.goto('/nl/');
    await expect(page.locator('#ip')).not.toHaveText('…');
    await expect(page).toHaveScreenshot('home-nl.png');
  });
  
  test('browser page', async ({ page }) => {
    await page.goto('/en/browser');
    
    // Wait for grid to populate
    await expect(page.locator('#grid .field')).toHaveCount(1, { timeout: 3000 });
    
    await expect(page).toHaveScreenshot('browser.png');
  });
  
  test('headers page', async ({ page }) => {
    await page.goto('/en/headers');
    
    // Wait for headers to load
    await expect(page.locator('#grid .field')).toHaveCount(1, { timeout: 3000 });
    
    await expect(page).toHaveScreenshot('headers.png');
  });
  
  test('WebRTC page', async ({ page }) => {
    await page.goto('/en/webrtc');
    
    // Wait for test to complete
    await expect(page.locator('#public')).not.toContainText('Testing…', { timeout: 10000 });
    
    await expect(page).toHaveScreenshot('webrtc.png');
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
    
    await expect(page).toHaveScreenshot('home-mobile.png');
  });
  
  test('tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en/browser');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('browser-tablet.png');
  });
});
