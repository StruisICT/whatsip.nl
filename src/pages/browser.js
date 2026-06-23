document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v,info){if(v===null||v===undefined||v===""||v==="unknown")return"";var i=info?'<a href="about:support" class="info-icon" title="'+esc(info)+'" target="_blank">ⓘ</a>':'';return '<div class="field"><div class="k">'+esc(k)+i+'</div><div class="v">'+esc(v)+"</div></div>";}
  var isFirefox=/Firefox\//.test(navigator.userAgent);
  function gpu(){try{var c=document.createElement("canvas");var gl=c.getContext("webgl")||c.getContext("experimental-webgl");if(!gl)return null;var i=gl.getExtension("WEBGL_debug_renderer_info");return i?gl.getParameter(i.UNMASKED_RENDERER_WEBGL):null;}catch(e){return null;}}
  function yn(b){return b?t("v.yes"):t("v.no");}

  var n=navigator, s=screen, conn=n.connection||n.mozConnection||n.webkitConnection||{};
  var uaD=n.userAgentData, tz=null;
  try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch(e){}
  
  var realSpeed = null;
  var speedTesting = false;
  
  function measureSpeed() {
    if (speedTesting) return;
    speedTesting = true;
    
    // Aggressive multi-stream test with warm-up and peak measurement
    var streams = 32; // More streams = better saturation
    var sizePerStreamKB = 20000; // 20MB per stream = 640MB total
    var warmupMs = 3000; // Ignore first 3 seconds (TCP slow start)
    
    var startTime = performance.now();
    var bytesReceived = 0;
    var peakSpeed = 0;
    var lastMeasure = startTime;
    var lastBytes = 0;
    
    // Track bytes received in real-time to calculate peak speed
    var checkInterval = setInterval(function() {
      var now = performance.now();
      var elapsed = (now - lastMeasure) / 1000;
      
      if (elapsed >= 1.0 && (now - startTime) > warmupMs) {
        // Measure speed over last second
        var newBytes = bytesReceived - lastBytes;
        var mbps = (newBytes * 8) / (1024 * 1024 * elapsed);
        
        if (mbps > peakSpeed) peakSpeed = mbps;
        
        lastMeasure = now;
        lastBytes = bytesReceived;
      }
    }, 500); // Check twice per second
    
    var promises = [];
    for (var i = 0; i < streams; i++) {
      var promise = fetch("/speedtest?size=" + sizePerStreamKB + "&s=" + i + "&c=" + Date.now(), { cache: "no-store" })
        .then(function(res) {
          // Use Response.body stream to track progress
          var reader = res.body.getReader();
          var chunks = [];
          
          function readChunk() {
            return reader.read().then(function(result) {
              if (result.done) {
                return new Blob(chunks);
              }
              chunks.push(result.value);
              bytesReceived += result.value.length;
              return readChunk();
            });
          }
          
          return readChunk();
        });
      promises.push(promise);
    }
    
    Promise.all(promises)
      .then(function() {
        clearInterval(checkInterval);
        
        var end = performance.now();
        var totalDuration = (end - startTime) / 1000;
        var effectiveDuration = totalDuration - (warmupMs / 1000);
        
        // Use peak speed if we measured it, otherwise fall back to average
        if (peakSpeed > 0) {
          realSpeed = peakSpeed.toFixed(1);
        } else {
          var totalMB = bytesReceived / (1024 * 1024);
          var mbps = (totalMB * 8) / totalDuration;
          realSpeed = mbps.toFixed(1);
        }
        
        updateConnectionField();
        speedTesting = false;
      })
      .catch(function(err) {
        clearInterval(checkInterval);
        console.error("Speed test failed:", err);
        speedTesting = false;
        updateConnectionField();
      });
  }
  
  function updateConnectionField() {
    var connField = document.querySelector('[data-field="connection"]');
    if (!connField) return;
    
    var value = "";
    if (realSpeed) {
      value = "~" + realSpeed + " Mbps (peak measured)";
    } else if (conn.effectiveType) {
      value = conn.effectiveType.toUpperCase();
      if (conn.downlink) value += " · browser est. ~" + conn.downlink + " Mbps";
      if (conn.rtt) value += " · " + conn.rtt + " ms";
      value += " (measuring 640MB download...)";
    } else {
      value = "Measuring speed...";
    }
    
    connField.querySelector('.v').textContent = value;
  }

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
    field(t("f.gpu"),gpu(),isFirefox?"Firefox may show outdated GPU info if your graphics card was upgraded. The WebGL cache isn't automatically refreshed. Click to open about:support for current hardware details.":null)+
    '<div class="field" data-field="connection"><div class="k">'+esc(t("f.conn"))+'</div><div class="v">Testing...</div></div>'+
    field(t("f.savedata"),conn.saveData?t("v.on"):null)+
    field(t("f.cookies"),yn(n.cookieEnabled))+
    field(t("f.dnt"),n.doNotTrack==="1"?t("v.on"):t("v.off"))+
    field(t("f.online"),yn(n.onLine));
  
  // Start speed test after rendering
  updateConnectionField();
  setTimeout(measureSpeed, 100);
});
