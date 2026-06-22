// Edge function: GET /api/info — returns the visitor's IP + connection metadata
// as JSON, read entirely from Cloudflare's edge (no origin hop, no storage).

interface CfProps {
  asn?: number;
  asOrganization?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  colo?: string;
  httpProtocol?: string;
  tlsVersion?: string;
}

export const onRequestGet: PagesFunction = ({ request }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const cf = (request.cf ?? {}) as CfProps;

  // Echo a safe subset of request headers (no cookies / auth).
  const headers: Record<string, string> = {};
  const allow = ["user-agent", "accept-language", "accept", "referer", "cf-ipcountry", "x-forwarded-for"];
  for (const [k, v] of request.headers) {
    if (allow.includes(k.toLowerCase())) headers[k] = v;
  }

  const body = {
    ip,
    family: ip.includes(":") ? "IPv6" : ip ? "IPv4" : null,
    asn: cf.asn ?? null,
    org: cf.asOrganization ?? null,
    country: cf.country ?? null,
    city: cf.city ?? null,
    region: cf.region ?? null,
    timezone: cf.timezone ?? null,
    colo: cf.colo ?? null,
    httpProtocol: cf.httpProtocol ?? null,
    tlsVersion: cf.tlsVersion ?? null,
    headers,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
