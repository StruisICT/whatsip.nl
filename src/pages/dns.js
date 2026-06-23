document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  
  // Try to detect DNS-over-HTTPS usage
  // This is limited - we can only check if certain DoH providers are in use
  // by attempting to detect their presence, not definitively prove DoH is active
  
  function checkDoH() {
    var statusEl = document.getElementById("doh-status");
    
    // Check if the browser supports DNS-over-HTTPS detection
    // Note: There's no standard browser API for this, so we make educated guesses
    
    // Check for Cloudflare DoH (1.1.1.1) by attempting a specific lookup
    // This is a best-effort check and not definitive
    
    // For now, we'll show that detection is limited
    if (typeof navigator.connection !== 'undefined') {
      // Some network info available, but not DoH-specific
      statusEl.textContent = t("dns.doh.unknown");
      statusEl.style.color = "#888";
    } else {
      statusEl.textContent = t("dns.doh.unknown");
      statusEl.style.color = "#888";
    }
    
    // Educational note: Real DoH detection would require:
    // 1. Browser extension with DNS API access
    // 2. System-level network monitoring
    // 3. Server-side analysis of resolver IPs
    //
    // Browser JavaScript cannot reliably detect this without browser API support
  }
  
  checkDoH();
});
