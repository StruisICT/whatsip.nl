document.addEventListener("DOMContentLoaded", function () {
  var t = window.t || function (k) { return k; };
  function esc(s){return String(s).replace(/[<>&]/g,function(c){return{"<":"&lt;",">":"&gt;","&":"&amp;"}[c];});}
  function field(k,v,status){
    if(v===null||v===undefined||v==="")return"";
    var icon = status === "yes" ? "✓" : status === "no" ? "✗" : "";
    var color = status === "yes" ? "color:#10b981" : status === "no" ? "color:#ef4444" : "";
    return '<div class="field"><div class="k">'+k+'</div><div class="v" style="'+color+'">'+icon+' '+esc(v)+"</div></div>";
  }

  // Test Cookies
  var cookiesEnabled = navigator.cookieEnabled;
  var cookieTest = "unknown";
  if (cookiesEnabled) {
    try {
      document.cookie = "testcookie=1; SameSite=Strict";
      cookieTest = document.cookie.indexOf("testcookie") !== -1 ? "Working" : "Blocked";
      document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    } catch (e) {
      cookieTest = "Error: " + e.message;
    }
  } else {
    cookieTest = "Disabled";
  }

  // Test LocalStorage
  var localStorageTest = "unknown";
  var localStorageSize = 0;
  try {
    localStorage.setItem("test", "1");
    localStorage.removeItem("test");
    localStorageTest = "Available";
    // Estimate quota
    var testStr = new Array(1024).join("a"); // 1KB
    var i = 0;
    while (i < 10000) { // Test up to ~10MB
      try {
        localStorage.setItem("sizeTest", testStr.repeat(i));
        i++;
      } catch (e) {
        localStorageSize = i - 1;
        break;
      }
    }
    localStorage.removeItem("sizeTest");
  } catch (e) {
    localStorageTest = "Blocked/Disabled";
  }

  // Test SessionStorage
  var sessionStorageTest = "unknown";
  try {
    sessionStorage.setItem("test", "1");
    sessionStorage.removeItem("test");
    sessionStorageTest = "Available";
  } catch (e) {
    sessionStorageTest = "Blocked/Disabled";
  }

  // Test IndexedDB
  var indexedDBTest = "unknown";
  if (window.indexedDB) {
    try {
      var req = indexedDB.open("testdb");
      req.onsuccess = function() {
        indexedDBTest = "Available";
        indexedDB.deleteDatabase("testdb");
        renderResults();
      };
      req.onerror = function() {
        indexedDBTest = "Blocked/Disabled";
        renderResults();
      };
    } catch (e) {
      indexedDBTest = "Error: " + e.message;
    }
  } else {
    indexedDBTest = "Not supported";
  }

  // Test Do Not Track
  var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  var dntStatus = dnt === "1" ? "Enabled (DNT: 1)" : dnt === "0" ? "Disabled (DNT: 0)" : "Not set";

  // Test Third-party cookies (heuristic)
  var thirdPartyCookies = document.cookie.length > 0 ? "Likely allowed" : "Likely blocked";

  function renderResults() {
    document.getElementById("grid").innerHTML =
      field(t("storage.cookies"), cookieTest, cookiesEnabled ? "yes" : "no") +
      field(t("storage.localStorage"), localStorageTest + (localStorageSize > 0 ? " (~" + localStorageSize + " KB quota)" : ""), localStorageTest === "Available" ? "yes" : "no") +
      field(t("storage.sessionStorage"), sessionStorageTest, sessionStorageTest === "Available" ? "yes" : "no") +
      field(t("storage.indexedDB"), indexedDBTest, indexedDBTest === "Available" ? "yes" : "no") +
      field(t("storage.dnt"), dntStatus, dnt === "1" ? "yes" : null) +
      field(t("storage.cookieCount"), document.cookie.split(";").filter(Boolean).length + " cookies") +
      "";
  }

  // Initial render (IndexedDB will update async)
  renderResults();
});
