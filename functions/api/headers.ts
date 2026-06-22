// Edge function: GET /api/headers — all request headers the visitor sent,
// as JSON (cookies/authorization redacted). Powers the Headers tool page.

export const onRequestGet: PagesFunction = ({ request }) => {
  const redact = new Set(["cookie", "authorization"]);
  const headers: Record<string, string> = {};
  for (const [k, v] of request.headers) {
    headers[k] = redact.has(k.toLowerCase()) ? "[redacted]" : v;
  }
  return new Response(JSON.stringify({ headers }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
