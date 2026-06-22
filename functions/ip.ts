// Edge function: GET /ip — the visitor's IP as plain text. Built for `curl whatsip.nl/ip`.

export const onRequestGet: PagesFunction = ({ request }) =>
  new Response((request.headers.get("CF-Connecting-IP") ?? "") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
