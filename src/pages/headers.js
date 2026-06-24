document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  fetch("/api/headers",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){
    var h=d.headers||{};
    document.getElementById("grid").innerHTML=Object.keys(h).map(function(k){
      return '<div class="field"><div class="k">'+esc(k)+'</div><div class="v">'+esc(h[k])+"</div></div>";
    }).join("")||"";
    var btn=document.getElementById("copy");
    btn.disabled=false;
    btn.addEventListener("click",function(){window.whatsipCopy(JSON.stringify(h,null,2),btn);});
  }).catch(function(err){
    console.error("Failed to load headers:", err);
    document.getElementById("grid").innerHTML='<p class="label" style="color:#ef4444">'+t("err.headers")+"</p>";
  });
});
