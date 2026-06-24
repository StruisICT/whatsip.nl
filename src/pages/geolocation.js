document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v){if(v===null||v===undefined||v==="")return"";return '<div class="field"><div class="k">'+k+'</div><div class="v">'+esc(v)+"</div></div>";}

  var btn = document.getElementById("test");
  var grid = document.getElementById("grid");

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    grid.innerHTML = '<p class="label" style="color:#ef4444">Geolocation not supported by this browser</p>';
    btn.disabled = true;
    return;
  }

  // Check current permission state
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
      if (result.state === 'granted') {
        grid.innerHTML = '<p class="label">✓ Location already allowed. Click to test.</p>';
      } else if (result.state === 'denied') {
        grid.innerHTML = '<p class="label" style="color:#ef4444">✗ Location blocked. Enable in browser settings.</p>';
      } else {
        grid.innerHTML = '<p class="label">Click "Test Geolocation" to check browser location access</p>';
      }
    }).catch(function() {
      grid.innerHTML = '<p class="label">Click "Test Geolocation" to check browser location access</p>';
    });
  } else {
    grid.innerHTML = '<p class="label">Click "Test Geolocation" to check browser location access</p>';
  }

  btn.addEventListener("click", function() {
    btn.disabled = true;
    btn.textContent = "Testing...";
    grid.innerHTML = '<p class="label">Requesting location permission...</p>';

    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lat = position.coords.latitude.toFixed(6);
        var lon = position.coords.longitude.toFixed(6);
        var acc = position.coords.accuracy.toFixed(0);
        var alt = position.coords.altitude ? position.coords.altitude.toFixed(0) + " m" : "Not available";
        var altAcc = position.coords.altitudeAccuracy ? position.coords.altitudeAccuracy.toFixed(0) + " m" : "Not available";
        var heading = position.coords.heading ? position.coords.heading.toFixed(0) + "°" : "Not available";
        var speed = position.coords.speed ? position.coords.speed.toFixed(1) + " m/s" : "Not available";
        var timestamp = new Date(position.timestamp).toLocaleString();

        grid.innerHTML =
          field(t("geo.latitude"), lat) +
          field(t("geo.longitude"), lon) +
          field(t("geo.accuracy"), acc + " meters") +
          field(t("geo.altitude"), alt) +
          field(t("geo.altitudeAccuracy"), altAcc) +
          field(t("geo.heading"), heading) +
          field(t("geo.speed"), speed) +
          field(t("geo.timestamp"), timestamp) +
          '<div class="field"><div class="k">'+t("geo.map")+'</div><div class="v"><a href="https://www.openstreetmap.org/?mlat='+lat+'&mlon='+lon+'&zoom=15" target="_blank" rel="noopener">View on OpenStreetMap ↗</a></div></div>';

        btn.textContent = "Test Again";
        btn.disabled = false;
      },
      function(error) {
        var msg = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information unavailable";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out";
            break;
          default:
            msg = "Unknown error: " + error.message;
        }
        grid.innerHTML = '<p class="label" style="color:#ef4444">'+esc(msg)+'</p>';
        btn.textContent = "Try Again";
        btn.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
});
