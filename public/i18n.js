// Shared, cached. NL/EN i18n. Language = saved choice, else browser/OS language
// (nl* -> Dutch, otherwise English). Toggle persists and reloads to re-render.
(function () {
  var T = {
    en: {
      "title.home": "whatsip.nl — What is my IP address?",
      "title.browser": "Browser info — whatsip.nl",
      "title.headers": "Request headers — whatsip.nl",
      "title.webrtc": "WebRTC leak test — whatsip.nl", "title.ipv6": "IPv6 test — whatsip.nl",
      "nav.myip": "My IP", "nav.browser": "Browser", "nav.headers": "Headers",
      "nav.webrtc": "WebRTC", "nav.ipv6": "IPv6", "nav.dns": "DNS",
      "w.title": "WebRTC leak test",
      "w.desc": "WebRTC can reveal your local network address and, behind a VPN, sometimes your real IP. This test runs entirely in your browser.",
      "w.local": "Local addresses", "w.public": "Public addresses (via STUN)", "w.none": "None detected",
      "w.testing": "Testing\u2026", "w.compare": "Your public IP (for comparison)",
      "w.safe": "No WebRTC leak detected",
      "w.warn": "WebRTC exposed a public IP \u2014 if you use a VPN, check it matches the VPN, not your real IP.",
      "w.off": "Your browser blocked or disabled WebRTC \u2014 nothing leaks.",
      "v6.title": "IPv6 connectivity test",
      "v6.desc": "Whether your connection can reach the internet over IPv6, and how you reached this site.",
      "v6.reached": "You reached whatsip.nl over", "v6.capability": "IPv6 capability", "v6.testing": "Testing\u2026",
      "v6.has": "Your connection supports IPv6 \u2713", "v6.no": "No IPv6 detected \u2014 you are IPv4-only",
      "v6.unavail": "Capability test unavailable (IPv6 probe host not configured yet).",
      "home.label": "Your public IP address", "home.copy": "Copy IP", "home.tip": "Power user?",
      "f.isp": "ISP / network", "f.location": "Location", "f.rdns": "Reverse DNS",
      "f.latency": "Latency", "f.connection": "Connection", "f.timezone": "Timezone",
      "tool.browser.t": "Browser info", "tool.browser.d": "Device, screen, GPU, connection",
      "tool.headers.t": "Request headers", "tool.headers.d": "What your browser sends",
      "tool.dns.t": "DNS leak test", "tool.dns.d": "Which resolvers you use",
      "footer.privacyNote": "No cookies. No tracking. Your IP is read at Cloudflare's edge and never stored.",
      "footer.note": "No cookies. No tracking.", "footer.privacy": "Privacy",
      "b.title": "Browser & device info",
      "b.local": "Everything below is read locally in your browser — it is not sent to us.",
      "f.browser": "Browser", "f.platform": "Platform", "f.mobile": "Mobile", "f.languages": "Languages",
      "f.screen": "Screen", "f.viewport": "Viewport", "f.dpr": "Pixel ratio", "f.cores": "CPU cores",
      "f.memory": "Device memory", "f.touch": "Touch points", "f.gpu": "GPU", "f.conn": "Connection",
      "f.savedata": "Save-Data", "f.cookies": "Cookies enabled", "f.dnt": "Do Not Track",
      "f.online": "Online", "f.ua": "User agent",
      "v.yes": "Yes", "v.no": "No", "v.on": "On", "v.off": "Off",
      "h.title": "Your request headers",
      "h.desc": "The HTTP headers your browser sent on this request. Cookies are redacted.",
      "h.copy": "Copy as JSON",
      "err.ip": "Could not detect IP", "err.headers": "Could not load headers.",
      "aria.theme": "Switch colour theme", "aria.lang": "Switch language",
    },
    nl: {
      "title.home": "whatsip.nl — Wat is mijn IP-adres?",
      "title.browser": "Browserinfo — whatsip.nl",
      "title.headers": "Verzoek-headers — whatsip.nl",
      "title.webrtc": "WebRTC-lektest — whatsip.nl", "title.ipv6": "IPv6-test — whatsip.nl",
      "nav.myip": "Mijn IP", "nav.browser": "Browser", "nav.headers": "Headers",
      "nav.webrtc": "WebRTC", "nav.ipv6": "IPv6", "nav.dns": "DNS",
      "w.title": "WebRTC-lektest",
      "w.desc": "WebRTC kan je lokale netwerkadres onthullen en achter een VPN soms je echte IP. Deze test draait volledig in je browser.",
      "w.local": "Lokale adressen", "w.public": "Publieke adressen (via STUN)", "w.none": "Geen gevonden",
      "w.testing": "Bezig met testen\u2026", "w.compare": "Jouw publieke IP (ter vergelijking)",
      "w.safe": "Geen WebRTC-lek gevonden",
      "w.warn": "WebRTC onthulde een publiek IP \u2014 gebruik je een VPN, controleer dan of dit het VPN-IP is en niet je echte IP.",
      "w.off": "Je browser heeft WebRTC geblokkeerd of uitgeschakeld \u2014 er lekt niets.",
      "v6.title": "IPv6-verbindingstest",
      "v6.desc": "Of je verbinding het internet via IPv6 kan bereiken, en hoe je deze site bereikte.",
      "v6.reached": "Je bereikte whatsip.nl via", "v6.capability": "IPv6-mogelijkheid", "v6.testing": "Bezig met testen\u2026",
      "v6.has": "Je verbinding ondersteunt IPv6 \u2713", "v6.no": "Geen IPv6 gevonden \u2014 je bent alleen IPv4",
      "v6.unavail": "Mogelijkheidstest niet beschikbaar (IPv6-testhost nog niet ingesteld).",
      "home.label": "Jouw publieke IP-adres", "home.copy": "Kopieer IP", "home.tip": "Gevorderde gebruiker?",
      "f.isp": "Provider / netwerk", "f.location": "Locatie", "f.rdns": "Reverse DNS",
      "f.latency": "Latentie", "f.connection": "Verbinding", "f.timezone": "Tijdzone",
      "tool.browser.t": "Browserinfo", "tool.browser.d": "Apparaat, scherm, GPU, verbinding",
      "tool.headers.t": "Verzoek-headers", "tool.headers.d": "Wat je browser verstuurt",
      "tool.dns.t": "DNS-lektest", "tool.dns.d": "Welke resolvers je gebruikt",
      "footer.privacyNote": "Geen cookies. Geen tracking. Je IP wordt aan de rand van Cloudflare gelezen en nooit opgeslagen.",
      "footer.note": "Geen cookies. Geen tracking.", "footer.privacy": "Privacy",
      "b.title": "Browser- en apparaatinfo",
      "b.local": "Alles hieronder wordt lokaal in je browser gelezen — het wordt niet naar ons verzonden.",
      "f.browser": "Browser", "f.platform": "Platform", "f.mobile": "Mobiel", "f.languages": "Talen",
      "f.screen": "Scherm", "f.viewport": "Viewport", "f.dpr": "Pixelverhouding", "f.cores": "CPU-kernen",
      "f.memory": "Apparaatgeheugen", "f.touch": "Touchpunten", "f.gpu": "GPU", "f.conn": "Verbinding",
      "f.savedata": "Data besparen", "f.cookies": "Cookies aan", "f.dnt": "Do Not Track",
      "f.online": "Online", "f.ua": "User agent",
      "v.yes": "Ja", "v.no": "Nee", "v.on": "Aan", "v.off": "Uit",
      "h.title": "Jouw verzoek-headers",
      "h.desc": "De HTTP-headers die je browser bij dit verzoek heeft verstuurd. Cookies zijn weggelaten.",
      "h.copy": "Kopieer als JSON",
      "err.ip": "Kon IP niet detecteren", "err.headers": "Kon headers niet laden.",
      "aria.theme": "Wissel kleurthema", "aria.lang": "Wissel taal",
    },
  };

  function detect() {
    try { var s = localStorage.getItem("lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
    return (navigator.language || "en").toLowerCase().indexOf("nl") === 0 ? "nl" : "en";
  }
  var lang = detect();
  window.t = function (k) { return (T[lang] && T[lang][k]) || T.en[k] || k; };
  window.getLang = function () { return lang; };

  function apply() {
    document.documentElement.setAttribute("lang", lang);
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) els[i].textContent = window.t(els[i].getAttribute("data-i18n"));
    var ar = document.querySelectorAll("[data-i18n-aria]");
    for (var j = 0; j < ar.length; j++) ar[j].setAttribute("aria-label", window.t(ar[j].getAttribute("data-i18n-aria")));
    var lb = document.getElementById("lang");
    if (lb) lb.textContent = lang.toUpperCase();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#lang");
    if (!b) return;
    lang = lang === "nl" ? "en" : "nl";
    try { localStorage.setItem("lang", lang); } catch (e2) {}
    location.reload();
  });

  if (document.readyState !== "loading") apply();
  else document.addEventListener("DOMContentLoaded", apply);
})();
