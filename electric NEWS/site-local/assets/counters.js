(function () {
  var els = document.querySelectorAll("[data-count-to]");
  if (!els.length) return;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  els.forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 900, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
