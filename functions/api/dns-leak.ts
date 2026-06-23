/**
 * DNS leak test endpoint
 * Logs which DNS resolver queried this domain and returns it to the client
 */
export const onRequestGet: PagesFunction = ({ request }) => {
  // Get Cloudflare request metadata
  const cf = (request as any).cf;
  
  // The DNS resolver IP is in the connecting IP when Cloudflare proxies DNS queries
  // For HTTP requests, we get the client IP which made the HTTP request
  const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
  
  // Get additional resolver info from CF headers
  const asn = cf?.asn || null;
  const country = cf?.country || null;
  const colo = cf?.colo || null; // Cloudflare datacenter
  
  // Identify known DNS providers
  let provider = "Unknown";
  let isPrivacy = false;
  
  // Check for known DNS provider ASNs and IPs
  const asnProviders: Record<number, string> = {
    13335: "Cloudflare (1.1.1.1)",
    15169: "Google (8.8.8.8)",
    19281: "Quad9 (9.9.9.9)",
    36692: "OpenDNS",
    174: "Cogent",
  };
  
  if (asn && asnProviders[asn]) {
    provider = asnProviders[asn];
    isPrivacy = [13335, 15169, 19281, 36692].includes(asn); // Known privacy DNS
  }
  
  // Build response
  const data = {
    ip: clientIP,
    asn,
    provider,
    country,
    colo,
    isPrivacy,
    timestamp: Date.now(),
  };
  
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
};
