#!/usr/bin/env node
/**
 * Add Google Search Console verification TXT record to Cloudflare DNS
 * Usage: node scripts/add-google-verification.mjs <verification-code>
 * Example: node scripts/add-google-verification.mjs google-site-verification=abcd1234...
 */
import https from 'node:https';

const ZONE_ID = '87faebac11f3bffdb78981c07a62bb3d'; // whatsip.nl zone
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN2; // DNS edit token

const verificationCode = process.argv[2];

if (!verificationCode) {
  console.error('❌ Error: No verification code provided');
  console.log('Usage: node scripts/add-google-verification.mjs <verification-code>');
  console.log('Example: node scripts/add-google-verification.mjs google-site-verification=abcd1234...');
  process.exit(1);
}

if (!API_TOKEN) {
  console.error('❌ Error: CLOUDFLARE_API_TOKEN2 environment variable not set');
  process.exit(1);
}

const data = JSON.stringify({
  type: 'TXT',
  name: 'whatsip.nl',
  content: verificationCode,
  ttl: 3600,
  comment: 'Google Search Console verification'
});

const options = {
  hostname: 'api.cloudflare.com',
  path: `/client/v4/zones/${ZONE_ID}/dns_records`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Adding Google verification TXT record to Cloudflare DNS...');
console.log(`   Record: ${verificationCode}`);

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    const result = JSON.parse(body);
    if (result.success) {
      console.log('✅ DNS record added successfully!');
      console.log(`   Record ID: ${result.result.id}`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Wait 1-2 minutes for DNS propagation');
      console.log('2. Go to Google Search Console and click "Verify"');
      console.log('3. Once verified, submit sitemap: https://whatsip.nl/sitemap.xml');
    } else {
      console.error('❌ Failed to add DNS record:');
      console.error(JSON.stringify(result.errors, null, 2));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.write(data);
req.end();
