import { test, expect } from '@playwright/test';

test.describe('whatsip.nl E2E tests', () => {

  test('home page loads and displays IP', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/What is my IP/i);

    // Wait for IP to load (replaces "…")
    await expect(page.locator('#ip')).not.toHaveText('…', { timeout: 5000 });

    const ipText = await page.locator('#ip').textContent();
    expect(ipText).toMatch(/\d+\.\d+\.\d+\.\d+|[0-9a-f:]+/i);
  });

  test('copy IP button works', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only in Playwright');
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);
    await page.goto('/');

    await expect(page.locator('#ip')).not.toHaveText('…');
    await page.locator('#copy').click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/\d+\.\d+\.\d+\.\d+|[0-9a-f:]+/i);
  });

  test('language toggle swaps copy in place (no navigation)', async ({ page }) => {
    await page.goto('/');

    // Baked default is English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Toggle to Dutch — client-side, same URL, no reload
    await page.locator('#lang').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(page).toHaveTitle(/Wat is mijn IP/i);
    await expect(page).toHaveURL(/\/$/); // still the flat root
    const stored = await page.evaluate(() => localStorage.getItem('lang'));
    expect(stored).toBe('nl');
    // A translated static label should now be Dutch
    await expect(page.locator('.hero .label')).toHaveText(/publieke IP-adres/i);
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');

    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    await page.locator('#theme').click();
    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(newTheme).not.toBe(initialTheme);

    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
  });

  test('navigation between tools works', async ({ page }) => {
    await page.goto('/');

    await page.locator('nav a[href="/browser"]').click();
    await expect(page).toHaveURL(/\/browser$/);
    await expect(page).toHaveTitle(/Browser info/);

    await page.locator('nav a[href="/headers"]').click();
    await expect(page).toHaveURL(/\/headers$/);
    await expect(page).toHaveTitle(/Request headers/);
  });

  test('browser page shows device info', async ({ page }) => {
    await page.goto('/browser');

    const grid = page.locator('#grid');
    await expect(grid).toBeVisible();

    const fields = await grid.locator('.field').count();
    expect(fields).toBeGreaterThan(5);
    await expect(grid).toContainText(/Browser|Platform|Screen/i);
  });

  test('headers page displays request headers', async ({ page }) => {
    await page.goto('/headers');

    const grid = page.locator('#grid');
    await expect(grid).toBeVisible();
    await expect(grid.locator('.field').first()).toBeVisible({ timeout: 5000 });
    expect(await grid.locator('.field').count()).toBeGreaterThan(3);
    await expect(grid).toContainText(/user-agent/i);
  });

  test('WebRTC page runs leak test', async ({ page }) => {
    await page.goto('/webrtc');

    await expect(page.locator('#status')).not.toContainText('Testing…', { timeout: 10000 });
    expect(await page.locator('#grid .field').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#grid')).toContainText(/None detected|\d+\.\d+\.\d+\.\d+|[0-9a-f:]{4,}/i);
  });

  test('IPv6 page shows connectivity', async ({ page }) => {
    await page.goto('/ipv6');

    const reachedBox = page.locator('.card').first();
    await expect(reachedBox).not.toContainText('…', { timeout: 5000 });
    await expect(reachedBox).toContainText(/IPv[46]/);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page).toHaveTitle(/Privacy/);
    await expect(page.locator('main')).toContainText(/cookies/i);
  });

  test('no ad scripts load', async ({ page }) => {
    await page.goto('/');

    const adsenseScript = page.locator('script[src*="googlesyndication.com"]');
    await expect(adsenseScript).toHaveCount(0);
  });

  test('canonical is self-referential and flat', async ({ page }) => {
    await page.goto('/browser');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/browser$/);
    // No hreflang alternates in the flat structure
    await expect(page.locator('link[hreflang]')).toHaveCount(0);
  });

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('#ip')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    const grid = page.locator('#grid');
    const gridBox = await grid.boundingBox();
    expect(gridBox?.width).toBeLessThan(400);
  });

  test('root serves the home page directly (no redirect)', async ({ page }) => {
    const response = await page.request.get('/', { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('<html lang="en"');
  });
});
