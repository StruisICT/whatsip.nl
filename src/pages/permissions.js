document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function row(name, state) {
    var color = state === "granted" ? "color:#10b981" : state === "denied" ? "color:#ef4444" : "";
    var icon = state === "granted" ? "✓ " : state === "denied" ? "✗ " : "";
    var label = state === "granted" ? t("perm.granted")
      : state === "denied" ? t("perm.denied")
      : state === "prompt" ? t("perm.prompt")
      : t("perm.unsupported");
    return '<div class="field"><div class="k">' + esc(name) + '</div><div class="v" style="' + color + '">' + icon + esc(label) + "</div></div>";
  }

  var grid = document.getElementById("grid");

  if (!navigator.permissions || !navigator.permissions.query) {
    grid.innerHTML = '<p class="label" style="color:#ef4444">' + esc(t("perm.noapi")) + "</p>";
    return;
  }

  // Permission names worth showing. Browsers vary in what they support;
  // unsupported names reject and are reported as "not queryable".
  var names = [
    "geolocation", "notifications", "camera", "microphone",
    "clipboard-read", "clipboard-write", "persistent-storage",
    "push", "midi", "background-sync"
  ];

  var results = {};
  var done = 0;

  function render() {
    grid.innerHTML = names.map(function (n) { return row(n, results[n]); }).join("");
  }

  names.forEach(function (name) {
    var finish = function (state) { results[name] = state; done++; if (done === names.length) render(); };
    try {
      navigator.permissions.query({ name: name })
        .then(function (r) { finish(r.state); })
        .catch(function () { finish("unsupported"); });
    } catch (e) {
      finish("unsupported");
    }
  });
});
