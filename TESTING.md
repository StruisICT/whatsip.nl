# Testing Documentation

Comprehensive test suite for whatsip.nl covering all aspects of the site.

## Test Categories

### 1. Build Validation
**File:** `tests/build-validation.mjs`  
**Run:** `npm run test:build`

Verifies:
- All expected files generated (`dist/en/`, `dist/nl/`)
- Assets exist (CSS, JS, sitemap, robots.txt)
- Pages have minimum content and correct structure
- Sitemap contains all URLs
- AdSense script present

### 2. HTML Validation
**File:** `tests/html-validation.mjs`  
**Run:** `npm run test:html`  
**Requires:** `html-validate` package

Validates all generated HTML against HTML5 standards.

### 3. Link Checking
**File:** `tests/link-checker.mjs`  
**Run:** `npm run test:links`

Checks:
- All internal links resolve correctly
- No broken navigation
- Assets exist (images, CSS, JS)
- External links use HTTPS

### 4. API Endpoint Tests
**File:** `tests/api-tests.mjs`  
**Run:** `npm run test:api`

Tests edge functions:
- `/ip` - returns plain text IP
- `/api/info` - returns JSON with IP metadata
- `/api/headers` - returns request headers
- Root redirect (`/` → `/en/` or `/nl/`)
- Language pages serve correct content
- Hreflang tags present
- Sitemap and robots.txt accessible

### 5. End-to-End Tests
**Files:** `tests/e2e/*.spec.ts`  
**Run:** `npm run test:e2e`  
**Framework:** Playwright

Browser automation tests:
- Page loads and displays IP
- Copy button works
- Language toggle works
- Theme toggle persists
- Navigation between tools
- All tool pages function correctly
- Responsive design (mobile/tablet)
- Accept-Language routing

**Browsers tested:**
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Mobile Chrome
- Mobile Safari

### 6. Accessibility Tests
**File:** `tests/accessibility.mjs`  
**Run:** `npm run test:a11y`  
**Framework:** axe-core via Playwright

WCAG 2.2 AAA compliance checks:
- Color contrast
- Keyboard navigation
- ARIA labels
- Semantic HTML
- Screen reader compatibility

### 7. Performance Tests
**File:** `tests/performance.mjs`  
**Run:** `npm run test:perf`  
**Framework:** Lighthouse

Measures:
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals (LCP, FID, CLS)

**Thresholds:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥95
- LCP: ≤2500ms
- CLS: ≤0.1

### 8. Visual Regression Tests
**File:** `tests/e2e/visual.spec.ts`  
**Run:** `npm run test:visual`  
**Framework:** Playwright screenshots

Screenshot comparison for:
- All pages (EN/NL)
- Light/dark themes
- Mobile/tablet viewports

## Running Tests

### All tests
```bash
npm test
```

### Individual test suites
```bash
npm run test:build       # Build validation
npm run test:html        # HTML validation
npm run test:links       # Link checking
npm run test:api         # API endpoints
npm run test:e2e         # End-to-end (all browsers)
npm run test:a11y        # Accessibility
npm run test:perf        # Performance
npm run test:visual      # Visual regression
```

### Test against production
```bash
TEST_URL=https://whatsip.nl npm test
```

### Test against local dev
```bash
# Terminal 1: start dev server
npm run dev

# Terminal 2: run tests
TEST_URL=http://localhost:8788 npm test
```

## Installation

Install test dependencies:
```bash
npm install
npx playwright install  # Install browsers
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main`
- Every pull request
- Nightly (performance tests)

See `.github/workflows/test.yml` for CI configuration.

## Updating Baselines (Visual Tests)

When intentional visual changes are made:
```bash
npm run test:visual -- --update-snapshots
```

## Debugging Failed Tests

### E2E test failures
```bash
# Run with UI
npx playwright test --ui

# Run with trace
npx playwright test --trace on

# Debug single test
npx playwright test --debug tests/e2e/site.spec.ts -g "home page"
```

### Check screenshots
Failed visual tests save screenshots to `test-results/`

### View Lighthouse reports
Performance test failures generate HTML reports in `lighthouse-reports/`

## Adding New Tests

1. Create test file in appropriate `tests/` subdirectory
2. Add npm script to `package.json`
3. Update this documentation
4. Run locally before committing
5. Check CI passes on PR

## Coverage Goals

- **Build:** 100% of generated files validated
- **HTML:** All pages valid HTML5
- **Links:** Zero broken internal links
- **API:** All endpoints functional
- **E2E:** Critical user flows covered
- **A11y:** WCAG 2.2 AAA compliant
- **Perf:** LCP <2.5s, CLS <0.1
- **Visual:** All pages/themes/viewports

## Continuous Monitoring

- Lighthouse CI runs nightly
- Performance budgets enforced
- Accessibility regressions blocked
- Visual changes require approval
