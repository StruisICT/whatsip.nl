document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v,info){if(v===null||v===undefined||v===""||v==="unknown")return"";var i=info?'<span class="info-icon" title="'+esc(info)+'">ⓘ</span>':'";return '<div class="field"><div class="k">'+esc(k)+i+'</div><div class="v">'+esc(v)+"</div></div>";}
  var isFirefox=/Firefox\//.test(navigator.userAgent);
  function gpu(){try{var c=document.createElement("canvas");var gl=c.getContext("webgl")||c.getContext("experimental-webgl");if(!gl)return null;var i=gl.getExtension("WEBGL_debug_renderer_info");return i?gl.getParameter(i.UNMASKED_RENDERER_WEBGL):null;}catch(e){return null;}}
  function yn(b){return b?t("v.yes"):t("v.no");}

  var n=navigator, s=screen, conn=n.connection||n.mozConnection||n.webkitConnection||{};
  var uaD=n.userAgentData, tz=null;
  try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch(e){}

  document.getElementById("grid").innerHTML=
    field(t("f.browser"),uaD&&uaD.brands?uaD.brands.map(function(b){return b.brand+" "+b.version;}).filter(function(x){return !/Not.?A.?Brand/i.test(x);}).join(", "):null)+
    field(t("f.platform"),uaD?uaD.platform:n.platform)+
    field(t("f.mobile"),uaD?yn(uaD.mobile):null)+
    field(t("f.languages"),(n.languages||[n.language]).join(", "))+
    field(t("f.timezone"),tz)+
    field(t("f.screen"),s.width+"×"+s.height+" ("+s.colorDepth+"-bit)")+
    field(t("f.viewport"),window.innerWidth+"×"+window.innerHeight)+
    field(t("f.dpr"),window.devicePixelRatio)+
    field(t("f.cores"),n.hardwareConcurrency)+
    field(t("f.memory"),n.deviceMemory?n.deviceMemory+" GB":null)+
    field(t("f.touch"),n.maxTouchPoints)+
    field(t("f.gpu"),gpu(),isFirefox?"Firefox may show cached GPU info. For accurate data, check about:support → Graphics section.":null)+
    field(t("f.conn"),conn.effectiveType?conn.effectiveType.toUpperCase()+(conn.downlink?" · ~"+conn.downlink+" Mbps":"")+(conn.rtt?" · "+conn.rtt+" ms":""):null)+
    field(t("f.savedata"),conn.saveData?t("v.on"):null)+
    field(t("f.cookies"),yn(n.cookieEnabled))+
    field(t("f.dnt"),n.doNotTrack==="1"?t("v.on"):t("v.off"))+
    field(t("f.online"),yn(n.onLine))+
    field(t("f.ua"),n.userAgent);
});
