/**
 * API endpoint tests
 * Test /ip, /api/info, /api/headers return correct data
 */
const BASE_URL = process.env.TEST_URL || "https://whatsip.nl";

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
  const res = await fetch(`${BASE_URL}/ip`);
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
  const res = await fetch(`${BASE_URL}/api/info`);
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

// Test root redirect
await test("GET / redirects to /en/ or /nl/", async () => {
  const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  if (res.status !== 302) throw new Error(`Expected 302, got ${res.status}`);
  
  const location = res.headers.get("location");
  if (!location.match(/\/(en|nl)\/$/)) {
    throw new Error(`Invalid redirect: ${location}`);
  }
});

// Test language pages
await test("GET /en/ returns English page", async () => {
  const res = await fetch(`${BASE_URL}/en/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const html = await res.text();
  if (!html.includes('<html lang="en"')) {
    throw new Error("Page is not English");
  }
  if (!html.includes("What is my IP")) {
    throw new Error("Missing English content");
  }
});

await test("GET /nl/ returns Dutch page", async () => {
  const res = await fetch(`${BASE_URL}/nl/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const html = await res.text();
  if (!html.includes('<html lang="nl"')) {
    throw new Error("Page is not Dutch");
  }
  if (!html.includes("Wat is mijn IP")) {
    throw new Error("Missing Dutch content");
  }
});

// Test hreflang tags
await test("Pages include proper hreflang tags", async () => {
  const res = await fetch(`${BASE_URL}/en/browser`);
  const html = await res.text();
  
  if (!html.includes('hreflang="en"')) throw new Error("Missing en hreflang");
  if (!html.includes('hreflang="nl"')) throw new Error("Missing nl hreflang");
  if (!html.includes('hreflang="x-default"')) throw new Error("Missing x-default");
});

// Test sitemap
await test("GET /sitemap.xml returns valid sitemap", async () => {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const xml = await res.text();
  if (!xml.includes("<?xml")) throw new Error("Not XML");
  if (!xml.includes("<urlset")) throw new Error("Not a sitemap");
  if (!xml.includes("/en/")) throw new Error("Missing /en/ URLs");
  if (!xml.includes("/nl/")) throw new Error("Missing /nl/ URLs");
});

// Test robots.txt
await test("GET /robots.txt returns valid robots file", async () => {
  const res = await fetch(`${BASE_URL}/robots.txt`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const txt = await res.text();
  if (!txt.includes("User-agent:")) throw new Error("Invalid robots.txt");
  if (!txt.includes("Sitemap:")) throw new Error("Missing sitemap reference");
});

// Test ads.txt
await test("GET /ads.txt returns AdSense publisher ID", async () => {
  const res = await fetch(`${BASE_URL}/ads.txt`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const txt = await res.text();
  if (!txt.includes("google.com, pub-1732510177342289")) {
    throw new Error("Missing or wrong publisher ID");
  }
});

console.log(`\n${errors === 0 ? "✓" : "✗"} API tests: ${errors === 0 ? "PASSED" : `FAILED (${errors} errors)`}`);
process.exit(errors > 0 ? 1 : 0);
