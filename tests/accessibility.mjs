/**
 * Accessibility tests
 * WCAG 2.2 AAA compliance checks using axe-core
 */
import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const BASE_URL = process.env.TEST_URL || 'https://whatsip.nl';
const PAGES = [
  '/en/',
  '/en/browser',
  '/en/headers',
  '/en/webrtc',
  '/en/ipv6',
  '/en/privacy',
  '/nl/',
];

let totalViolations = 0;

console.log(`Running accessibility tests (WCAG 2.2 AAA)...\n`);

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

for (const pagePath of PAGES) {
  const url = `${BASE_URL}${pagePath}`;
  console.log(`Checking ${pagePath}...`);
  
  try {
    // 'load', not 'networkidle': the IPv6 page's capability probe keeps the
    // network busy and networkidle never settles outside production
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Run accessibility check
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log(`  ✗ ${results.violations.length} violations found:`);
      for (const violation of results.violations) {
        console.log(`    - ${violation.id}: ${violation.description}`);
        console.log(`      Impact: ${violation.impact}`);
        console.log(`      Nodes: ${violation.nodes.length}`);
        totalViolations++;
      }
    } else {
      console.log(`  ✓ No violations`);
    }
    
    // Check for incomplete tests (warnings)
    if (results.incomplete.length > 0) {
      console.log(`  ⚠ ${results.incomplete.length} incomplete checks (manual review needed)`);
    }
    
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    totalViolations++;
  }
}

await browser.close();

console.log(`\n${totalViolations === 0 ? "✓" : "✗"} Accessibility: ${totalViolations === 0 ? "PASSED" : `${totalViolations} violations`}`);
process.exit(totalViolations > 0 ? 1 : 0);
