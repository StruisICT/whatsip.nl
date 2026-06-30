document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){if(v===null||v===undefined||v==="")return"";return '<div class="field"><div class="k">'+k+'</div><div class="v">'+esc(v)+"</div></div>";}
  function note(msg,err){grid.innerHTML='<p class="label"'+(err?' style="color:#ef4444"':'')+'>'+esc(msg)+'</p>';}

  var btn = document.getElementById("test");
  var grid = document.getElementById("grid");

  if (!navigator.geolocation) {
    note(t("geo.unsupported"), true);
    btn.disabled = true;
    return;
  }

  // Reflect the current permission state (best-effort).
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then(function (r) {
      if (r.state === "granted") note(t("geo.granted"));
      else if (r.state === "denied") note(t("geo.denied"), true);
      else note(t("geo.testing"));
    }).catch(function () { note(t("geo.testing")); });
  } else {
    note(t("geo.testing"));
  }

  function locate(highAccuracy) {
    btn.disabled = true;
    btn.textContent = t("geo.btn.locating");
    note(t("geo.requesting"));

    navigator.geolocation.getCurrentPosition(
      function (p) {
        var c = p.coords;
        var lat = c.latitude.toFixed(6);
        var lon = c.longitude.toFixed(6);
        grid.innerHTML =
          field(t("geo.latitude"), lat) +
          field(t("geo.longitude"), lon) +
          field(t("geo.accuracy"), Math.round(c.accuracy) + " m") +
          field(t("geo.altitude"), c.altitude != null ? Math.round(c.altitude) + " m" : "—") +
          field(t("geo.heading"), c.heading != null ? Math.round(c.heading) + "°" : "—") +
          field(t("geo.speed"), c.speed != null ? c.speed.toFixed(1) + " m/s" : "—") +
          field(t("geo.timestamp"), new Date(p.timestamp).toLocaleString()) +
          '<div class="field"><div class="k">' + esc(t("geo.map")) + '</div><div class="v"><a href="https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '&zoom=15" target="_blank" rel="noopener">OpenStreetMap ↗</a></div></div>';
        btn.textContent = t("geo.btn.again");
        btn.disabled = false;
      },
      function (e) {
        var msg;
        if (e.code === e.PERMISSION_DENIED) msg = t("geo.err.denied");
        else if (e.code === e.POSITION_UNAVAILABLE) msg = t("geo.err.unavailable");
        else if (e.code === e.TIMEOUT) msg = t("geo.err.timeout");
        else msg = t("geo.err.unknown") + " " + (e.message || "");
        note(msg, true);
        btn.textContent = t("geo.btn.again");
        btn.disabled = false;
      },
      {
        // Network/Wi-Fi location: fast and reliable on desktop. High accuracy
        // (GPS) only helps on phones and often just times out on desktop.
        enableHighAccuracy: !!highAccuracy,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  }

  btn.addEventListener("click", function () { locate(false); });
});
