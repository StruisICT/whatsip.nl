import { test, expect } from '@playwright/test';

test.describe('whatsip.nl E2E tests', () => {
  
  test('home page loads and displays IP', async ({ page }) => {
    await page.goto('/en/');
    
    // Check title
    await expect(page).toHaveTitle(/What is my IP/);
    
    // Wait for IP to load (replaces "…")
    await expect(page.locator('#ip')).not.toHaveText('…', { timeout: 5000 });
    
    // Should have an IP address displayed
    const ipText = await page.locator('#ip').textContent();
    expect(ipText).toMatch(/\d+\.\d+\.\d+\.\d+|[0-9a-f:]+/i);
  });

  test('copy IP button works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);
    await page.goto('/en/');
    
    // Wait for IP to load
    await expect(page.locator('#ip')).not.toHaveText('…');
    
    // Click copy button
    await page.locator('#copy').click();
    
    // Verify clipboard (modern API)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/\d+\.\d+\.\d+\.\d+|[0-9a-f:]+/i);
  });

  test('language toggle works', async ({ page }) => {
    await page.goto('/en/');
    
    // Should be on English page
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    // Click NL language toggle
    await page.locator('a[aria-label="Switch language"]').click();
    
    // Should now be on Dutch page
    await expect(page).toHaveURL(/\/nl\//);
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(page).toHaveTitle(/Wat is mijn IP/);
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/en/');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    
    // Click theme button
    await page.locator('#theme').click();
    
    // Theme should have changed
    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(newTheme).not.toBe(initialTheme);
    
    // localStorage should be set
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
  });

  test('navigation between tools works', async ({ page }) => {
    await page.goto('/en/');
    
    // Navigate to Browser page
    await page.locator('nav a[href="/en/browser"]').click();
    await expect(page).toHaveURL(/\/en\/browser$/);
    await expect(page).toHaveTitle(/Browser info/);
    
    // Navigate to Headers
    await page.locator('nav a[href="/en/headers"]').click();
    await expect(page).toHaveURL(/\/en\/headers$/);
    await expect(page).toHaveTitle(/Request headers/);
  });

  test('browser page shows device info', async ({ page }) => {
    await page.goto('/en/browser');
    
    // Should have grid of fields
    const grid = page.locator('#grid');
    await expect(grid).toBeVisible();
    
    // Should show at least some fields (not empty)
    const fields = await grid.locator('.field').count();
    expect(fields).toBeGreaterThan(5);
    
    // Check for expected fields
    await expect(grid).toContainText(/Browser|Platform|Screen/i);
  });

  test('headers page displays request headers', async ({ page }) => {
    await page.goto('/en/headers');
    
    const grid = page.locator('#grid');
    await expect(grid).toBeVisible();
    
    // Should show headers (wait for API response)
    await expect(grid.locator('.field')).toHaveCount(1, { timeout: 5000 });
    
    // Should have user-agent
    await expect(grid).toContainText(/user-agent/i);
  });

  test('WebRTC page runs leak test', async ({ page }) => {
    await page.goto('/en/webrtc');
    
    // Wait for test to complete (should replace "Testing…")
    const publicBox = page.locator('#public');
    await expect(publicBox).not.toContainText('Testing…', { timeout: 10000 });
    
    // Should show either IPs or "None detected"
    const text = await publicBox.textContent();
    expect(text).toMatch(/None detected|^\d+\.\d+\.\d+\.\d+/);
  });

  test('IPv6 page shows connectivity', async ({ page }) => {
    await page.goto('/en/ipv6');
    
    // Wait for protocol detection
    const reachedBox = page.locator('.card').first();
    await expect(reachedBox).not.toContainText('…', { timeout: 5000 });
    
    // Should show IPv4 or IPv6
    await expect(reachedBox).toContainText(/IPv[46]/);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/en/privacy');
    
    await expect(page).toHaveTitle(/Privacy/);
    await expect(page.locator('main')).toContainText(/No cookies/);
  });

  test('no ad scripts load', async ({ page }) => {
    await page.goto('/en/');

    const adsenseScript = page.locator('script[src*="googlesyndication.com"]');
    await expect(adsenseScript).toHaveCount(0);
  });

  test('hreflang tags are correct', async ({ page }) => {
    await page.goto('/en/browser');
    
    // Check for all three hreflang links
    const enLink = page.locator('link[hreflang="en"]');
    const nlLink = page.locator('link[hreflang="nl"]');
    const defaultLink = page.locator('link[hreflang="x-default"]');
    
    await expect(enLink).toHaveAttribute('href', /\/en\/browser$/);
    await expect(nlLink).toHaveAttribute('href', /\/nl\/browser$/);
    await expect(defaultLink).toHaveAttribute('href', /\/en\/browser$/);
  });

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/');
    
    // Page should still be functional
    await expect(page.locator('#ip')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Grid should reflow
    const grid = page.locator('#grid');
    const gridBox = await grid.boundingBox();
    expect(gridBox?.width).toBeLessThan(400);
  });

  test('root redirects based on Accept-Language', async ({ page, context }) => {
    // Set Dutch Accept-Language header
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'nl-NL,nl;q=0.9'
    });
    
    const response = await page.goto('/');
    
    // Should redirect to /nl/
    expect(page.url()).toMatch(/\/nl\/$/);
  });
});
