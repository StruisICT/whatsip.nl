document.addEventListener("DOMContentLoaded", function () {
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){return '<div class="field"><div class="k">'+esc(k)+'</div><div class="v">'+esc(v)+"</div></div>";}

  var local={}, pub={}, serverIp="", done=false, unavailable=false;

  function render(){
    var t = window.t || function (k) { return k; };
    var statusEl=document.getElementById("status"), gridEl=document.getElementById("grid");
    var locals=Object.keys(local), publics=Object.keys(pub);
    gridEl.innerHTML=
      field(t("w.local"), locals.length?locals.join(", "):t("w.none"))+
      field(t("w.public"), publics.length?publics.join(", "):t("w.none"))+
      (serverIp?field(t("w.compare"), serverIp):"");
    if (unavailable){ statusEl.textContent=t("w.off"); statusEl.className="status-line status-ok"; return; }
    if (!done) return; // leave the (data-i18n) "Testing…" text until the check finishes
    if (publics.length){ statusEl.textContent=t("w.warn"); statusEl.className="status-line status-warn"; }
    else { statusEl.textContent=t("w.safe"); statusEl.className="status-line status-ok"; }
  }

  fetch("/api/info",{cache:"no-store"}).then(function(r){return r.json();}).then(function(d){serverIp=d.ip||""; render();}).catch(function(){});

  var RTC=window.RTCPeerConnection||window.webkitRTCPeerConnection||window.mozRTCPeerConnection;
  if(!RTC){ unavailable=true; }
  else {
    try{
      var pc=new RTC({iceServers:[{urls:"stun:stun.cloudflare.com:3478"}]});
      pc.createDataChannel("");
      var finished=false;
      function finish(){if(finished)return;finished=true;done=true;try{pc.close();}catch(e){}render();}
      pc.onicecandidate=function(e){
        if(!e.candidate||!e.candidate.candidate){finish();return;}
        var c=e.candidate.candidate, parts=c.split(" ");
        var addr=parts[4], typ=c.indexOf("typ ")>=0?c.split("typ ")[1].split(" ")[0]:"";
        if(!addr) return;
        if(/\.local$/i.test(addr)) local[addr]=1;
        else if(typ==="host") local[addr]=1;
        else if(typ==="srflx"||typ==="prflx") pub[addr]=1;
        render();
      };
      pc.createOffer().then(function(o){return pc.setLocalDescription(o);}).catch(function(){finish();});
      setTimeout(finish,4000);
    }catch(e){ unavailable=true; }
  }

  render();
  if (window.onWhatsipLang) window.onWhatsipLang(render);
});
