// Edge function: GET /api/info — the visitor's IP + connection metadata as JSON,
// read at Cloudflare's edge (no origin hop, no storage). Adds reverse DNS via DoH.

interface CfProps {
  asn?: number;
  asOrganization?: string;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  timezone?: string;
  continent?: string;
  colo?: string;
  httpProtocol?: string;
  tlsVersion?: string;
  tlsCipher?: string;
  clientTcpRtt?: number;
  isEUCountry?: string;
}

function expandV6(ip: string): string {
  const [headPart, tailPart] = ip.split("::");
  const head = headPart ? headPart.split(":") : [];
  const tail = tailPart !== undefined ? (tailPart ? tailPart.split(":") : []) : [];
  const mid = Array(Math.max(0, 8 - head.length - tail.length)).fill("0");
  const groups = ip.includes("::") ? [...head, ...mid, ...tail] : ip.split(":");
  return groups.map((g) => g.padStart(4, "0")).join("");
}

async function reverseDns(ip: string): Promise<string | null> {
  if (!ip) return null;
  let name: string;
  try {
    if (ip.includes(":")) {
      name = expandV6(ip).split("").reverse().join(".") + ".ip6.arpa";
    } else {
      name = ip.split(".").reverse().join(".") + ".in-addr.arpa";
    }
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${name}&type=PTR`, {
      headers: { accept: "application/dns-json" },
    });
    const j = (await r.json()) as { Answer?: Array<{ type: number; data: string }> };
    const ans = j.Answer?.find((a) => a.type === 12);
    return ans ? ans.data.replace(/\.$/, "") : null;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const cf = (request.cf ?? {}) as CfProps;

  const body = {
    ip,
    family: ip.includes(":") ? "IPv6" : ip ? "IPv4" : null,
    reverseDns: await reverseDns(ip),
    asn: cf.asn ?? null,
    org: cf.asOrganization ?? null,
    country: cf.country ?? null,
    city: cf.city ?? null,
    region: cf.region ?? null,
    postalCode: cf.postalCode ?? null,
    continent: cf.continent ?? null,
    timezone: cf.timezone ?? null,
    colo: cf.colo ?? null,
    httpProtocol: cf.httpProtocol ?? null,
    tlsVersion: cf.tlsVersion ?? null,
    tlsCipher: cf.tlsCipher ?? null,
    latencyMs: typeof cf.clientTcpRtt === "number" ? cf.clientTcpRtt : null,
    isEU: cf.isEUCountry === "1",
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
