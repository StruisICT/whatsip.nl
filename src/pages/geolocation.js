document.addEventListener("DOMContentLoaded", function () {
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  var btn = document.getElementById("test");
  var grid = document.getElementById("grid");

  // Rendering is driven off this state so a language toggle can redraw it.
  var state = { mode: "init", perm: null, coords: null, ts: null, errCode: null, errMsg: "" };

  function t(){ return window.t || function (k) { return k; }; }
  function field(k,v){if(v===null||v===undefined||v==="")return"";return '<div class="field"><div class="k">'+k+'</div><div class="v">'+esc(v)+"</div></div>";}
  function note(msg,err){grid.innerHTML='<p class="label"'+(err?' style="color:#ef4444"':'')+'>'+esc(msg)+'</p>';}

  function render(){
    var _=t();
    if (!navigator.geolocation) { note(_("geo.unsupported"), true); btn.disabled = true; return; }

    if (state.mode === "located" && state.coords) {
      var c = state.coords;
      var lat = c.latitude.toFixed(6), lon = c.longitude.toFixed(6);
      grid.innerHTML =
        field(_("geo.latitude"), lat) +
        field(_("geo.longitude"), lon) +
        field(_("geo.accuracy"), Math.round(c.accuracy) + " m") +
        field(_("geo.altitude"), c.altitude != null ? Math.round(c.altitude) + " m" : "—") +
        field(_("geo.heading"), c.heading != null ? Math.round(c.heading) + "°" : "—") +
        field(_("geo.speed"), c.speed != null ? c.speed.toFixed(1) + " m/s" : "—") +
        field(_("geo.timestamp"), new Date(state.ts).toLocaleString()) +
        '<div class="field"><div class="k">' + esc(_("geo.map")) + '</div><div class="v"><a href="https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '&zoom=15" target="_blank" rel="noopener">OpenStreetMap ↗</a></div></div>';
      btn.textContent = _("geo.btn.again"); btn.disabled = false;
    } else if (state.mode === "error") {
      var msg = state.errCode === "denied" ? _("geo.err.denied")
        : state.errCode === "unavailable" ? _("geo.err.unavailable")
        : state.errCode === "timeout" ? _("geo.err.timeout")
        : _("geo.err.unknown") + " " + state.errMsg;
      note(msg, true); btn.textContent = _("geo.btn.again"); btn.disabled = false;
    } else if (state.mode === "locating") {
      note(_("geo.requesting")); btn.textContent = _("geo.btn.locating"); btn.disabled = true;
    } else {
      if (state.perm === "granted") note(_("geo.granted"));
      else if (state.perm === "denied") note(_("geo.denied"), true);
      else note(_("geo.testing"));
      btn.textContent = _("geo.test"); btn.disabled = false;
    }
  }

  if (!navigator.geolocation) { render(); return; }

  // Reflect the current permission state (best-effort) — only while still at "init".
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then(function (r) {
      state.perm = r.state; if (state.mode === "init") render();
    }).catch(function () { if (state.mode === "init") render(); });
  }

  function locate(highAccuracy) {
    state.mode = "locating"; render();
    navigator.geolocation.getCurrentPosition(
      function (p) { state.mode = "located"; state.coords = p.coords; state.ts = p.timestamp; render(); },
      function (e) {
        state.mode = "error";
        state.errCode = e.code === e.PERMISSION_DENIED ? "denied"
          : e.code === e.POSITION_UNAVAILABLE ? "unavailable"
          : e.code === e.TIMEOUT ? "timeout" : "unknown";
        state.errMsg = e.message || "";
        render();
      },
      { enableHighAccuracy: !!highAccuracy, timeout: 20000, maximumAge: 60000 }
    );
  }

  btn.addEventListener("click", function () { locate(false); });
  render();
  if (window.onWhatsipLang) window.onWhatsipLang(render);
});
