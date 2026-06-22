// Root language router: GET / -> 302 to /nl/ or /en/ based on Accept-Language.
// Cookieless (keeps the zero-cookie promise); an explicit toggle just navigates
// to the other /lang/ URL. Crawlers follow the 302 and use hreflang/x-default.
export const onRequest: PagesFunction = ({ request }) => {
  const first = (request.headers.get("accept-language") || "").toLowerCase().split(",")[0].trim();
  const lang = first.startsWith("nl") ? "nl" : "en";
  return Response.redirect(new URL(`/${lang}/`, request.url).toString(), 302);
};
