// Shared across every page (cached once). Service worker, theme toggle, copy helper.

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function(err) {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

// Theme toggle: auto -> light -> dark
(function () {
  var root = document.documentElement;
  var saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("#theme");
    if (!btn) return;
    var order = ["auto", "light", "dark"];
    var cur = root.getAttribute("data-theme") || "auto";
    var next = order[(order.indexOf(cur) + 1) % order.length];
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    btn.setAttribute("title", "Theme: " + next);
  });
})();

// Copy helper reused by tools. Pass the text + the button element.
window.whatsipCopy = function (text, btn) {
  if (!text) return;
  var done = function () {
    var t = btn.textContent; btn.textContent = "Copied \u2713";
    setTimeout(function () { btn.textContent = t; }, 1500);
  };
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else { fallback(); }
};
