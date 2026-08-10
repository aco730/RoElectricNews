(function () {
  var input = document.getElementById("site-search");
  var results = document.getElementById("site-search-results");
  if (!input || !results) return;

  var DIA = {"ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t"};
  function norm(s) {
    return (s || "").toLowerCase().replace(/[ăâîșşțţ]/g, function (c) { return DIA[c] || c; });
  }

  function render(query) {
    var q = norm(query).trim();
    if (!q) { results.innerHTML = ""; results.classList.remove("open"); return; }
    var data = window.ELECTRIC_NEWS_SEARCH || [];
    var matches = data.filter(function (it) { return norm(it.t).indexOf(q) !== -1; }).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">Niciun rezultat pentru „' + query + '"</div>';
      results.classList.add("open");
      return;
    }
    var root = window.SITE_ROOT || "";
    results.innerHTML = matches.map(function (it) {
      return '<a class="search-result" href="' + root + it.p + '">' +
        '<span class="search-result-cat">' + it.c + '</span>' +
        '<span class="search-result-title">' + it.t + '</span></a>';
    }).join("");
    results.classList.add("open");
  }

  input.addEventListener("input", function () { render(input.value); });
  input.addEventListener("focus", function () { if (input.value) render(input.value); });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-box")) { results.classList.remove("open"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { results.classList.remove("open"); input.blur(); }
  });
})();
