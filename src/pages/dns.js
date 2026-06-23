document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  
  var leakStatusEl = document.getElementById("leak-status");
  var leakResultsEl = document.getElementById("leak-results");
  var retestBtn = document.getElementById("retest-btn");
  
  var dohStatusEl = document.getElementById("doh-status");
  var dohDetailEl = document.getElementById("doh-detail");
  
  // Test configuration
  var TEST_DOMAINS = ["test1", "test2", "test3", "test4", "test5"];
  var CACHE_BUSTER = Date.now();
  
  function runDNSLeakTest() {
    leakStatusEl.textContent = t("dns.leak.running");
    leakResultsEl.innerHTML = "";
    retestBtn.style.display = "none";
    
    var results = [];
    var completed = 0;
    
    // Query each test domain to trigger DNS lookups
    TEST_DOMAINS.forEach(function(domain, index) {
      var url = "https://" + domain + ".whatsip.nl/api/dns-leak?test=" + CACHE_BUSTER + "&n=" + index;
      
      fetch(url, { cache: "no-store" })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          results.push(data);
          completed++;
          checkCompletion();
        })
        .catch(function(err) {
          console.error("DNS test error:", err);
          completed++;
          checkCompletion();
        });
    });
    
    function checkCompletion() {
      if (completed === TEST_DOMAINS.length) {
        displayResults(results);
      }
    }
  }
  
  function displayResults(results) {
    // Remove duplicates and analyze
    var uniqueIPs = {};
    var hasPrivacy = false;
    var hasISP = false;
    
    results.forEach(function(r) {
      if (r && r.ip && r.ip !== "unknown") {
        uniqueIPs[r.ip] = r;
        if (r.isPrivacy) hasPrivacy = true;
        else hasISP = true;
      }
    });
    
    var ips = Object.keys(uniqueIPs);
    
    if (ips.length === 0) {
      leakStatusEl.textContent = "Test failed - could not detect DNS servers";
      leakStatusEl.style.color = "#888";
      retestBtn.style.display = "inline-block";
      return;
    }
    
    // Determine leak status
    var isLeak = hasISP && !hasPrivacy;
    
    if (isLeak) {
      leakStatusEl.textContent = t("dns.leak.warning");
      leakStatusEl.style.color = "#ff9800";
    } else {
      leakStatusEl.textContent = t("dns.leak.safe");
      leakStatusEl.style.color = "#4caf50";
    }
    
    // Display detected servers
    var html = "<div style='margin-top: 0.75rem;'>";
    html += "<strong>" + t("dns.leak.servers") + ":</strong>";
    html += "<ul style='margin: 0.5rem 0 0 1.5rem; font-family: monospace; font-size: 0.9rem;'>";
    
    ips.forEach(function(ip) {
      var info = uniqueIPs[ip];
      var provider = info.provider || "Unknown";
      var flag = info.isPrivacy ? " ✓" : " ⚠";
      var color = info.isPrivacy ? "color: #4caf50;" : "color: #ff9800;";
      
      html += "<li style='" + color + "'>" + ip + " — " + provider + flag;
      if (info.country) html += " (" + info.country + ")";
      html += "</li>";
    });
    
    html += "</ul>";
    
    // Add explanation
    if (isLeak) {
      html += "<p style='margin-top: 1rem; font-size: 0.9rem; color: var(--muted);'>";
      html += t("dns.leak.isp") + " ";
      html += "If you're using a VPN or privacy DNS service, your queries should go through their servers, not your ISP's.";
      html += "</p>";
    } else if (hasPrivacy) {
      html += "<p style='margin-top: 1rem; font-size: 0.9rem; color: var(--muted);'>";
      html += t("dns.leak.privacy");
      html += "</p>";
    }
    
    html += "</div>";
    leakResultsEl.innerHTML = html;
    retestBtn.style.display = "inline-block";
  }
  
  function checkDoH() {
    // Check for DNS-over-HTTPS usage
    var detected = false;
    var method = "";
    
    if (location.protocol === "https:" && typeof navigator.connection !== "undefined") {
      if (navigator.connection.saveData === false) {
        method = "Possible (HTTPS context)";
        detected = true;
      }
    }
    
    if (typeof window.dns !== "undefined" || typeof navigator.dns !== "undefined") {
      method = "Browser DNS API detected";
      detected = true;
    }
    
    if (detected) {
      dohStatusEl.textContent = t("dns.doh.enabled");
      dohStatusEl.style.color = "#4caf50";
      dohDetailEl.textContent = method;
    } else {
      dohStatusEl.textContent = t("dns.doh.unknown");
      dohStatusEl.style.color = "#888";
      dohDetailEl.textContent = "Check browser settings: Firefox: network.trr.mode, Chrome: chrome://settings/security";
    }
  }
  
  // Event listeners
  retestBtn.addEventListener("click", function() {
    CACHE_BUSTER = Date.now();
    runDNSLeakTest();
  });
  
  // Run tests on load
  runDNSLeakTest();
  checkDoH();
});
