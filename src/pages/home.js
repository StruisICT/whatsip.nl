document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };

  // Measure real round-trip latency to the edge (Cloudflare's clientTcpRtt is often 0).
  function measureLatency(){
    var samples=[];
    function done(){
      var el=document.querySelector('[data-field="latency"] .v');
      if(!el) return;
      if(!samples.length){ el.textContent="unavailable"; return; }
      el.textContent=Math.round(Math.min.apply(null,samples))+" ms";
    }
    function ping(left){
      if(left<=0){ return done(); }
      var start=performance.now();
      fetch("/ip?c="+Math.random(),{cache:"no-store"})
        .then(function(r){return r.text();})
        .then(function(){ samples.push(performance.now()-start); ping(left-1); })
        .catch(function(){ ping(left-1); });
    }
    ping(5);
  }

  // Honest heuristic: if the browser's own timezone differs from the timezone
  // implied by the IP's location, the user may be on a VPN/proxy.
  function vpnHint(ipTz){
    var btz="";try{btz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}
    if(!btz||!ipTz) return null;
    return btz===ipTz ? t("vpn.none") : t("vpn.maybe")+" ("+btz+" ≠ "+ipTz+")";
  }

  // Fields are pre-rendered in the HTML (labels + "…") so filling them causes
  // no layout shift; unavailable values become "—" instead of removing the row.
  function set(name,v){
    var el=document.querySelector('[data-field="'+name+'"] .v');
    if(el) el.textContent=(v===null||v===undefined||v==="")?"—":v;
  }

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    var ipEl=document.getElementById("ip");
    ipEl.textContent=d.ip||"unknown";
    document.getElementById("family").textContent=(d.family||"")+(d.colo?" · via "+d.colo:"");

    set("isp",d.org?d.org+(d.asn?" (AS"+d.asn+")":""):null);
    set("location",[d.city,d.region,d.country].filter(Boolean).join(", ")||d.country);
    set("rdns",d.reverseDns);
    set("connection",[d.httpProtocol,d.tlsVersion].filter(Boolean).join(" · "));
    set("timezone",d.timezone);
    set("vpnhint",vpnHint(d.timezone));

    var btn=document.getElementById("copy");
    btn.disabled=false;
    function copy(){window.whatsipCopy(d.ip||"",btn);}
    btn.addEventListener("click",copy);
    ipEl.addEventListener("click",copy);

    measureLatency();
  }).catch(function(err){
    console.error("Failed to load IP info:", err);
    var ipEl=document.getElementById("ip");
    ipEl.textContent=t("err.ip");
    ipEl.style.color="#ef4444";
    ["isp","location","rdns","latency","connection","timezone","vpnhint"].forEach(function(n){set(n,null);});
  });
});
