document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){if(v===null||v===undefined||v==="")return"";return '<div class="field"><div class="k">'+k+'</div><div class="v">'+esc(v)+"</div></div>";}

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    var ipEl=document.getElementById("ip");
    ipEl.textContent=d.ip||"unknown";
    document.getElementById("family").textContent=(d.family||"")+(d.colo?" · via "+d.colo:"");

    document.getElementById("grid").innerHTML=
      field(t("f.isp"),d.org?d.org+(d.asn?" (AS"+d.asn+")":""):null)+
      field(t("f.location"),[d.city,d.region,d.country].filter(Boolean).join(", ")||d.country)+
      field(t("f.rdns"),d.reverseDns)+
      field(t("f.latency"),d.latencyMs!=null?d.latencyMs+" ms":null)+
      field(t("f.connection"),[d.httpProtocol,d.tlsVersion].filter(Boolean).join(" · "))+
      field(t("f.timezone"),d.timezone);

    var btn=document.getElementById("copy");
    btn.disabled=false;
    function copy(){window.whatsipCopy(d.ip||"",btn);}
    btn.addEventListener("click",copy);
    ipEl.addEventListener("click",copy);
  }).catch(function(){document.getElementById("ip").textContent=t("err.ip");});
});
