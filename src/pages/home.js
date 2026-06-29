document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){if(v===null||v===undefined||v==="")return"";return '<div class="field"><div class="k">'+k+'</div><div class="v">'+esc(v)+"</div></div>";}

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

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    var ipEl=document.getElementById("ip");
    ipEl.textContent=d.ip||"unknown";
    document.getElementById("family").textContent=(d.family||"")+(d.colo?" · via "+d.colo:"");

    document.getElementById("grid").innerHTML=
      field(t("f.isp"),d.org?d.org+(d.asn?" (AS"+d.asn+")":""):null)+
      field(t("f.location"),[d.city,d.region,d.country].filter(Boolean).join(", ")||d.country)+
      field(t("f.rdns"),d.reverseDns)+
      '<div class="field" data-field="latency"><div class="k">'+esc(t("f.latency"))+'</div><div class="v">…</div></div>'+
      field(t("f.connection"),[d.httpProtocol,d.tlsVersion].filter(Boolean).join(" · "))+
      field(t("f.timezone"),d.timezone);

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
  });
});
