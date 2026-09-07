/**
 * API endpoint tests
 * Test /ip, /api/info, /api/headers return correct data
 */
const BASE_URL = process.env.TEST_URL || "https://whatsip.nl";
// Outside Cloudflare (wrangler pages dev) there is no CF-Connecting-IP header;
// inject one so /ip and /api/info behave. Never sent to production — Cloudflare
// overwrites it there anyway.
const IP_HDRS = BASE_URL.includes("localhost") ? { "CF-Connecting-IP": "203.0.113.9" } : {};

let errors = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    errors++;
  }
}

console.log(`Testing API endpoints at ${BASE_URL}...\n`);

// Test /ip endpoint
await test("GET /ip returns plain text IP", async () => {
  const res = await fetch(`${BASE_URL}/ip`, { headers: IP_HDRS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const contentType = res.headers.get("content-type");
  if (!contentType.includes("text/plain")) {
    throw new Error(`Wrong content-type: ${contentType}`);
  }
  
  const ip = await res.text();
  // Basic IP validation (IPv4 or IPv6)
  if (!/^[\d.:a-f]+$/i.test(ip.trim())) {
    throw new Error(`Invalid IP format: ${ip}`);
  }
});

// Test /api/info endpoint
await test("GET /api/info returns JSON with required fields", async () => {
  const res = await fetch(`${BASE_URL}/api/info`, { headers: IP_HDRS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const contentType = res.headers.get("content-type");
  if (!contentType.includes("application/json")) {
    throw new Error(`Wrong content-type: ${contentType}`);
  }
  
  const data = await res.json();
  
  // Required fields
  const required = ["ip", "family", "country", "asn"];
  for (const field of required) {
    if (!(field in data)) throw new Error(`Missing field: ${field}`);
  }
  
  // Validate IP family
  if (!["IPv4", "IPv6"].includes(data.family)) {
    throw new Error(`Invalid family: ${data.family}`);
  }
  
  // Validate country code format
  if (!/^[A-Z]{2}$/.test(data.country)) {
    throw new Error(`Invalid country code: ${data.country}`);
  }
});

// Test /api/headers endpoint
await test("GET /api/headers returns JSON with headers", async () => {
  const res = await fetch(`${BASE_URL}/api/headers`, {
    headers: { "X-Test-Header": "test-value" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const data = await res.json();
  
  if (!data.headers || typeof data.headers !== "object") {
    throw new Error("Missing or invalid headers object");
  }
  
  // Should include common headers
  if (!data.headers["user-agent"]) {
    throw new Error("Missing user-agent header");
  }
});

// Root is served directly — no language redirect anymore.
await test("GET / serves the home page directly (no redirect)", async () => {
  const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);

  const html = await res.text();
  if (!html.includes('<html lang="en"')) throw new Error("Home is not baked English");
  if (!html.includes("What is my IP")) throw new Error("Missing English content");
});

// Flat tool page served directly.
await test("GET /browser serves the browser page directly", async () => {
  const res = await fetch(`${BASE_URL}/browser`, { redirect: "manual" });
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const html = await res.text();
  if (!html.includes('data-i18n=')) throw new Error("Missing i18n hooks");
});

// Client-side i18n: the NL dictionary ships in /i18n.js.
await test("GET /i18n.js carries both languages", async () => {
  const res = await fetch(`${BASE_URL}/i18n.js`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const js = await res.text();
  if (!js.includes("What is my IP")) throw new Error("Missing EN strings");
  if (!js.includes("Wat is mijn IP")) throw new Error("Missing NL strings");
});

// Self-referential canonical (flat URL, no hreflang alternates).
await test("Pages include a self-referential canonical", async () => {
  const res = await fetch(`${BASE_URL}/browser`);
  const html = await res.text();
  if (!/<link rel="canonical" href="[^"]*\/browser"/.test(html)) {
    throw new Error("Missing/incorrect canonical for /browser");
  }
  if (html.includes('hreflang=')) throw new Error("Unexpected hreflang in flat structure");
});

// Test sitemap
await test("GET /sitemap.xml returns valid sitemap", async () => {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const xml = await res.text();
  if (!xml.includes("<?xml")) throw new Error("Not XML");
  if (!xml.includes("<urlset")) throw new Error("Not a sitemap");
  if (!xml.includes("whatsip.nl/ipv6")) throw new Error("Missing flat tool URLs");
  if (xml.includes("/en/") || xml.includes("/nl/")) throw new Error("Unexpected localized URLs in sitemap");
});

// Test robots.txt
await test("GET /robots.txt returns valid robots file", async () => {
  const res = await fetch(`${BASE_URL}/robots.txt`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const txt = await res.text();
  if (!txt.includes("User-agent:")) throw new Error("Invalid robots.txt");
  if (!txt.includes("Sitemap:")) throw new Error("Missing sitemap reference");
});

console.log(`\n${errors === 0 ? "✓" : "✗"} API tests: ${errors === 0 ? "PASSED" : `FAILED (${errors} errors)`}`);
process.exit(errors > 0 ? 1 : 0);
