document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){return '<div class="field"><div class="k">'+esc(k)+'</div><div class="v">'+esc(v)+"</div></div>";}

  var capEl=document.getElementById("capability"), gridEl=document.getElementById("grid");

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    gridEl.innerHTML=field(t("v6.reached"),(d.family||"?")+(d.ip?" ("+d.ip+")":""));
  }).catch(function(){});

  function probe(host){
    return Promise.race([
      fetch("https://"+host+"/ip?"+Date.now(),{mode:"no-cors",cache:"no-store"}).then(function(){return true;}).catch(function(){return false;}),
      new Promise(function(res){setTimeout(function(){res(false);},4000);})
    ]);
  }
  // ipv4.whatsip.nl = A-only control, ipv6.whatsip.nl = AAAA-only probe.
  // These subdomains need DNS records: ipv4 (A only), ipv6 (AAAA only)
  Promise.all([probe("ipv4.whatsip.nl"),probe("ipv6.whatsip.nl")]).then(function(r){
    var control=r[0], v6=r[1];
    if(!control){capEl.textContent=t("v6.unavail");capEl.className="status-line";}
    else if(v6){capEl.textContent=t("v6.has");capEl.className="status-line status-ok";}
    else {capEl.textContent=t("v6.no");capEl.className="status-line status-warn";}
  });
});
