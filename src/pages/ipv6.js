document.addEventListener("DOMContentLoaded", function () {
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){return '<div class="field"><div class="k">'+esc(k)+'</div><div class="v">'+esc(v)+"</div></div>";}

  var info = null;        // /api/info payload (data — not translated)
  var capState = "testing"; // "testing" | "has" | "no" | "unavail"

  function render(){
    var t = window.t || function (k) { return k; };
    var capEl = document.getElementById("capability");
    var gridEl = document.getElementById("grid");
    if (info) gridEl.innerHTML = field(t("v6.reached"), (info.family||"?")+(info.ip?" ("+info.ip+")":""));
    if (capState === "unavail") { capEl.textContent = t("v6.unavail"); capEl.className = "status-line"; }
    else if (capState === "has") { capEl.textContent = t("v6.has"); capEl.className = "status-line status-ok"; }
    else if (capState === "no") { capEl.textContent = t("v6.no"); capEl.className = "status-line status-warn"; }
    else { capEl.textContent = t("v6.testing"); capEl.className = "status-line"; }
  }

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    info = d; render();
  }).catch(function(){});

  function probe(host){
    return Promise.race([
      fetch("https://"+host+"/ip?"+Date.now(),{mode:"no-cors",cache:"no-store"}).then(function(){return true;}).catch(function(){return false;}),
      new Promise(function(res){setTimeout(function(){res(false);},4000);})
    ]);
  }
  // ipv4.whatsip.nl = A-only control, ipv6.whatsip.nl = AAAA-only probe.
  Promise.all([probe("ipv4.whatsip.nl"),probe("ipv6.whatsip.nl")]).then(function(r){
    capState = !r[0] ? "unavail" : (r[1] ? "has" : "no");
    render();
  });

  render();
  if (window.onWhatsipLang) window.onWhatsipLang(render);
});
