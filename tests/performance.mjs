/**
 * Performance tests using Lighthouse
 * Verify Core Web Vitals and Lighthouse scores
 */
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'https://whatsip.nl';
const PAGES = ['/en/', '/en/browser'];

// Minimum acceptable scores (0-100)
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
};

let failures = 0;

console.log('Running Lighthouse performance tests...\n');

const browser = await chromium.launch({ headless: true });

for (const pagePath of PAGES) {
  const url = `${BASE_URL}${pagePath}`;
  console.log(`Testing ${pagePath}...`);
  
  try {
    const { lhr } = await lighthouse(url, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    });
    
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    };
    
    console.log(`  Performance:     ${scores.performance} ${scores.performance >= THRESHOLDS.performance ? '✓' : '✗'}`);
    console.log(`  Accessibility:   ${scores.accessibility} ${scores.accessibility >= THRESHOLDS.accessibility ? '✓' : '✗'}`);
    console.log(`  Best Practices:  ${scores.bestPractices} ${scores.bestPractices >= THRESHOLDS.bestPractices ? '✓' : '✗'}`);
    console.log(`  SEO:             ${scores.seo} ${scores.seo >= THRESHOLDS.seo ? '✓' : '✗'}`);
    
    // Core Web Vitals
    const lcp = lhr.audits['largest-contentful-paint'].numericValue;
    const fid = lhr.audits['max-potential-fid']?.numericValue || 0;
    const cls = lhr.audits['cumulative-layout-shift'].numericValue;
    
    console.log(`  LCP: ${Math.round(lcp)}ms, FID: ${Math.round(fid)}ms, CLS: ${cls.toFixed(3)}`);
    
    // Check thresholds
    for (const [key, score] of Object.entries(scores)) {
      if (score < THRESHOLDS[key]) {
        console.error(`  ✗ ${key} score ${score} below threshold ${THRESHOLDS[key]}`);
        failures++;
      }
    }
    
    // Core Web Vitals thresholds
    if (lcp > 2500) {
      console.error(`  ✗ LCP ${Math.round(lcp)}ms exceeds 2500ms`);
      failures++;
    }
    if (cls > 0.1) {
      console.error(`  ✗ CLS ${cls.toFixed(3)} exceeds 0.1`);
      failures++;
    }
    
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    failures++;
  }
  
  console.log('');
}

await browser.close();

console.log(`${failures === 0 ? "✓" : "✗"} Performance: ${failures === 0 ? "PASSED" : `${failures} failures`}`);
process.exit(failures > 0 ? 1 : 0);
