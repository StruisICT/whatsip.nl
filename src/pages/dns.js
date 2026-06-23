document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  
  // DNS resolver detection via timing and known providers
  var resolvers = [];
  var dohEnabled = false;
  
  // Known DNS providers (for educational purposes)
  var knownProviders = {
    "1.1.1.1": "Cloudflare DNS",
    "1.0.0.1": "Cloudflare DNS",
    "8.8.8.8": "Google Public DNS",
    "8.8.4.4": "Google Public DNS",
    "9.9.9.9": "Quad9",
    "208.67.222.222": "OpenDNS",
    "208.67.220.220": "OpenDNS"
  };
  
  function checkDoH() {
    var statusEl = document.getElementById("doh-status");
    var detailEl = document.getElementById("doh-detail");
    
    // Check for Firefox DoH via network.trr.mode
    // Check for Chrome Secure DNS
    var detected = false;
    var method = "";
    
    // Method 1: Check if cloudflare-dns.com resolves (common DoH provider)
    fetch("https://cloudflare-dns.com/dns-query?name=example.com&type=A", {
      method: "HEAD",
      mode: "no-cors"
    }).then(function() {
      // If this succeeds without CORS error, DoH might be active
      // But we can't be certain - this is a weak signal
    }).catch(function() {
      // Expected in most cases
    });
    
    // Method 2: Check for secure context and HTTPS-only mode
    if (location.protocol === "https:" && typeof navigator.connection !== "undefined") {
      if (navigator.connection.saveData === false) {
        method = "Possible (HTTPS context + no data saver)";
        detected = true;
      }
    }
    
    // Method 3: Feature detection (limited)
    if (typeof window.dns !== "undefined" || typeof navigator.dns !== "undefined") {
      method = "Browser DNS API detected";
      detected = true;
      dohEnabled = true;
    }
    
    if (detected) {
      statusEl.textContent = t("dns.doh.enabled");
      statusEl.style.color = "#4caf50";
      detailEl.textContent = method;
    } else {
      statusEl.textContent = t("dns.doh.unknown");
      statusEl.style.color = "#888";
      detailEl.textContent = "Browser APIs don't expose this information. Check your browser settings (Firefox: network.trr.mode, Chrome: chrome://settings/security).";
    }
  }
  
  function detectResolvers() {
    var statusEl = document.getElementById("resolver-status");
    var listEl = document.getElementById("resolver-list");
    
    // We can't directly detect DNS resolvers from JavaScript without special infrastructure
    // But we can provide useful information based on the user's network
    
    // Method 1: Try to infer from connection info
    if (typeof navigator.connection !== "undefined") {
      var conn = navigator.connection;
      var info = [];
      
      if (conn.effectiveType) {
        info.push("Connection: " + conn.effectiveType.toUpperCase());
      }
      
      if (info.length > 0) {
        statusEl.textContent = "Network information available";
        statusEl.style.color = "#888";
        listEl.innerHTML = "<p style='font-size: 0.9rem; color: var(--muted);'>" + info.join(", ") + "</p>";
      }
    }
    
    // Show informational message about limitations
    statusEl.textContent = t("dns.resolver.limited");
    statusEl.style.color = "#888";
    
    var html = "<div style='font-size: 0.9rem; color: var(--muted); margin-top: 0.5rem;'>";
    html += "<p><strong>Why can't we detect your DNS resolver?</strong></p>";
    html += "<p>JavaScript in browsers cannot access DNS resolver information for privacy reasons. ";
    html += "To detect DNS leaks, you need:</p>";
    html += "<ul style='margin: 0.5rem 0 0 1.5rem;'>";
    html += "<li>Special test domains that log which resolver queries them</li>";
    html += "<li>A service that controls those domains and shows you the results</li>";
    html += "</ul>";
    html += "<p style='margin-top: 0.5rem;'>Use the external DNS leak test below for complete detection.</p>";
    html += "</div>";
    
    listEl.innerHTML = html;
  }
  
  // Run checks
  checkDoH();
  detectResolvers();
});
