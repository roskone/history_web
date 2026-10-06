/* Карты: распадающаяся карта на главной, интерактивная карта княжеств, мини-карта для теста. */
(function () {
  "use strict";
  var M = window.RUS_MAP;
  var P = window.PRINCIPALITIES || {};
  if (!M) return;
  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgRoot(vb, cls, label) {
    var s = el("svg", { viewBox: vb.join(" "), class: cls, role: "img", "aria-label": label });
    return s;
  }
  function keys() { return Object.keys(M.principalities); }

  /* ---------------------------------------------------------------
     1. Распадающаяся карта (главная)
     --------------------------------------------------------------- */
  var HERO_LABEL_POS = {
    novgorod: [520, 270], vladimir: [668, 500], smolensk: [440, 668], polotsk: [262, 672],
    chernigov: [478, 820], kiev: [282, 918], pereyaslavl: [404, 968], turov: [226, 818],
    galich: [128, 905], ryazan: [664, 728]
  };
  function heroMap(host) {
    var vb = [0, -30, 880, 1090];
    var svg = svgRoot(vb, "hero-map", "Карта русских земель в 1237 году: единое пространство распадается на княжества");
    var defs = el("defs", null, svg);
    var grad = el("radialGradient", { id: "hm-fade", cx: "55%", cy: "50%", r: "62%" }, defs);
    el("stop", { offset: "55%", "stop-color": "#fff" }, grad);
    el("stop", { offset: "100%", "stop-color": "#000" }, grad);
    var mask = el("mask", { id: "hm-mask", maskUnits: "userSpaceOnUse", x: vb[0], y: vb[1], width: vb[2], height: vb[3] }, defs);
    el("rect", { x: vb[0], y: vb[1], width: vb[2], height: vb[3], fill: "url(#hm-fade)" }, mask);
    var water = el("g", { "aria-hidden": "true", mask: "url(#hm-mask)" }, svg);
    M.water.forEach(function (d) { el("path", { d: d, class: "hm-water" }, water); });
    var cx = 450, cy = 560, mag = 16;
    var pieces = el("g", null, svg);
    var labels = el("g", { "aria-hidden": "true" }, svg);
    var groups = {};
    keys().forEach(function (k) {
      var p = M.principalities[k];
      var dx = p.c[0] - cx, dy = p.c[1] - cy, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var shift = "--tx:" + (dx / len * mag).toFixed(1) + "px;--ty:" + (dy / len * mag).toFixed(1) + "px";
      var info = P[k] || {};
      var g = el("g", { class: "hm-g", style: shift, "data-key": k }, pieces);
      var a = el("a", { href: "knyazhestva.html#" + k, "aria-label": info.name || k }, g);
      el("path", { d: p.d, class: "hm-piece", style: "--c:" + (info.color || "#999"), "data-key": k }, a);
      var lg = el("g", { class: "hm-g", style: shift }, labels);
      var lp = HERO_LABEL_POS[k] || p.c;
      var t = el("text", { x: lp[0], y: lp[1], class: "hm-label", "text-anchor": "middle", "dominant-baseline": "middle" }, lg);
      t.textContent = info.short || k;
      groups[k] = [g, lg];
    });
    el("path", { d: M.outline, class: "hm-outline" }, svg);
    host.appendChild(svg);

    var cap = host.parentNode.querySelector(".hero-map-caption");
    var capDefault = cap ? cap.innerHTML : "";
    var hovered = null;
    function hover(k, how) {
      if (hovered) groups[hovered].forEach(function (x) { x.classList.remove("is-hover"); });
      hovered = k;
      if (!k) { if (cap) cap.innerHTML = capDefault; return; }
      groups[k].forEach(function (x) { x.classList.add("is-hover"); });
      if (cap && P[k]) cap.innerHTML = "<b>" + P[k].name + "</b> · " + (how === "focus" ? "нажмите Enter, чтобы открыть" : "нажмите, чтобы открыть");
    }
    svg.addEventListener("mouseover", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-key");
      if (k) hover(k);
    });
    svg.addEventListener("mouseleave", function () { hover(null); });
    svg.addEventListener("focusin", function (e) {
      var g = e.target.closest && e.target.closest(".hm-g");
      if (g) hover(g.getAttribute("data-key"), "focus");
    });
    svg.addEventListener("focusout", function () { hover(null); });

    // «Трещина»: единая Русь распадается на части
    if (reduceMotion) { svg.classList.add("is-split"); return; }
    var started = false;
    function split() { if (started) return; started = true; setTimeout(function () { svg.classList.add("is-split"); }, 700); }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { split(); io.disconnect(); } }, { threshold: .35 });
      io.observe(svg);
    } else split();
  }

  /* ---------------------------------------------------------------
     2. Интерактивная карта княжеств
     --------------------------------------------------------------- */
  var LABEL_OFF = { r: [7, 4, "start"], l: [-7, 4, "end"], t: [0, -9, "middle"], b: [0, 16, "middle"] };
  var REGION_LABELS = [
    { t: "Половцы", x: 560, y: 1062, cls: "m-region-label" },
    { t: "Волжская Булгария", x: 890, y: 772, cls: "m-region-label", anchor: "end" },
    { t: "Литва", x: 178, y: 640, cls: "m-region-label" },
    { t: "Польша", x: 46, y: 812, cls: "m-region-label", rot: -90 },
    { t: "Венгрия", x: 62, y: 1062, cls: "m-region-label" },
    { t: "Швеция", x: 92, y: 250, cls: "m-region-label" },
    { t: "Ливонский орден", x: 212, y: 566, cls: "m-region-label", size: 10 },
    { t: "Мордва", x: 780, y: 800, cls: "m-region-label" },
    { t: "Балтийское (Варяжское) море", x: 62, y: 560, cls: "m-sea-label", rot: -72 },
    { t: "Белое море", x: 560, y: 22, cls: "m-sea-label" },
    { t: "Чёрное (Русское) море", x: 300, y: 1100, cls: "m-sea-label" }
  ];

  function fullMap(host) {
    var vb0 = [0, 0, 900, 1110];
    var vb = vb0.slice();
    var stage = host.querySelector(".map-stage");
    var panel = host.querySelector(".map-panel");
    var legend = host.querySelector(".map-legend");
    var svg = svgRoot(vb, "map-svg", "Интерактивная карта русских княжеств в 1237 году");
    el("title", null, svg).textContent = "Русские княжества и земли в 1237 году";
    el("rect", { x: -200, y: -200, width: 1400, height: 1600, class: "m-land" }, svg);
    var gF = el("g", { "aria-hidden": "true" }, svg);
    M.foreign.forEach(function (d) { el("path", { d: d, class: "m-foreign" }, gF); });
    var gP = el("g", { role: "list" }, svg);
    var pieceByKey = {};
    keys().forEach(function (k) {
      var info = P[k] || {};
      var path = el("path", {
        d: M.principalities[k].d, class: "m-piece", "data-key": k, style: "--c:" + info.color,
        tabindex: "0", role: "button", "aria-label": info.name
      }, gP);
      pieceByKey[k] = path;
    });
    var gW = el("g", { "aria-hidden": "true" }, svg);
    M.water.forEach(function (d) { el("path", { d: d, class: "m-water" }, gW); });
    M.rivers.forEach(function (d) { el("path", { d: d, class: "m-river", "stroke-width": 1.1 }, gW); });
    M.lakeRims.forEach(function (d) { el("path", { d: d, class: "m-river", "stroke-width": .4 }, gW); });
    var gL = el("g", { "aria-hidden": "true" }, svg);
    REGION_LABELS.forEach(function (r) {
      var t = el("text", { x: r.x, y: r.y, class: r.cls, "text-anchor": r.anchor || "middle" }, gL);
      if (r.rot) t.setAttribute("transform", "rotate(" + r.rot + " " + r.x + " " + r.y + ")");
      if (r.size) t.style.fontSize = r.size + "px";
      t.textContent = r.t;
    });
    var gC = el("g", { "aria-hidden": "true" }, svg);
    M.cities.forEach(function (c) {
      var g = el("g", { class: "m-city " + c.k }, gC);
      if (c.k === "capital") { el("circle", { cx: c.x, cy: c.y, r: 5.5 }, g); el("circle", { cx: c.x, cy: c.y, r: 2.3, class: "core" }, g); }
      else el("circle", { cx: c.x, cy: c.y, r: c.k === "major" ? 3.4 : 2.6 }, g);
      var o = LABEL_OFF[c.a] || LABEL_OFF.r;
      var t = el("text", { x: c.x + o[0] * (c.k === "capital" ? 1.25 : 1), y: c.y + o[1] * (c.k === "capital" ? 1.15 : 1), "text-anchor": o[2] }, g);
      t.textContent = c.n;
    });
    stage.insertBefore(svg, stage.firstChild);

    var tip = document.createElement("div");
    tip.className = "map-tip"; tip.setAttribute("aria-hidden", "true");
    stage.appendChild(tip);

    var active = null;
    var emptyHTML = panel.innerHTML;
    function render(k) {
      var info = P[k];
      if (!info) { panel.innerHTML = emptyHTML; return; }
      var cities = M.cities.filter(function (c) { return c.p === k; }).map(function (c) { return c.n; });
      panel.innerHTML =
        '<span class="tag" style="--c:' + info.color + '">Земля на карте</span>' +
        "<h3>" + info.name + "</h3>" +
        "<p>" + info.text + "</p>" +
        '<dl class="facts">' +
        "<dt>Центр</dt><dd>" + info.capital + "</dd>" +
        "<dt>Власть</dt><dd>" + info.power + "</dd>" +
        "<dt>Князья</dt><dd>" + info.dynasty + "</dd>" +
        "<dt>Города</dt><dd>" + cities.join(", ") + "</dd>" +
        "</dl>" +
        '<p><a href="#' + info.anchor + '" data-goto="' + info.anchor + '">Подробнее о земле ↓</a></p>';
    }
    function select(k, opts) {
      opts = opts || {};
      if (active && pieceByKey[active]) pieceByKey[active].classList.remove("is-active");
      active = (active === k && !opts.force) ? null : k;
      svg.classList.toggle("has-active", !!active);
      if (active) {
        pieceByKey[active].classList.add("is-active");
        pieceByKey[active].parentNode.appendChild(pieceByKey[active]);
      }
      legend.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-key") === active)); });
      render(active);
      if (active && opts.scroll && window.innerWidth < 980) panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }
    // Легенда-кнопки (доступно с клавиатуры и на телефоне)
    keys().forEach(function (k) {
      var info = P[k]; if (!info) return;
      var li = document.createElement("li");
      li.innerHTML = '<button type="button" data-key="' + k + '" aria-pressed="false"><i class="dot" style="--c:' + info.color + '"></i>' + info.name + "</button>";
      legend.appendChild(li);
    });
    legend.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) select(b.getAttribute("data-key"), { force: true, scroll: true }); });

    // Перетаскивание и масштаб
    var drag = null, moved = false;
    function setVB() { svg.setAttribute("viewBox", vb.map(function (v) { return v.toFixed(1); }).join(" ")); }
    function zoom(f, cxu, cyu) {
      var nw = Math.min(vb0[2], Math.max(220, vb[2] * f));
      var nh = nw * vb0[3] / vb0[2];
      if (cxu == null) { cxu = vb[0] + vb[2] / 2; cyu = vb[1] + vb[3] / 2; }
      vb[0] = cxu - (cxu - vb[0]) * nw / vb[2];
      vb[1] = cyu - (cyu - vb[1]) * nh / vb[3];
      vb[2] = nw; vb[3] = nh; clamp(); setVB();
      svg.classList.toggle("show-minor", vb[2] < 640 || showAll);
    }
    function clamp() {
      vb[0] = Math.min(vb0[0] + vb0[2] - vb[2], Math.max(vb0[0], vb[0]));
      vb[1] = Math.min(vb0[1] + vb0[3] - vb[3], Math.max(vb0[1], vb[1]));
    }
    function toUser(evt) {
      var r = svg.getBoundingClientRect();
      return [vb[0] + (evt.clientX - r.left) / r.width * vb[2], vb[1] + (evt.clientY - r.top) / r.height * vb[3]];
    }
    svg.addEventListener("pointerdown", function (e) {
      if (vb[2] >= vb0[2]) { moved = false; return; }
      drag = { x: e.clientX, y: e.clientY, vb: vb.slice() }; moved = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var r = svg.getBoundingClientRect();
      var dx = (e.clientX - drag.x) / r.width * vb[2], dy = (e.clientY - drag.y) / r.height * vb[3];
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) moved = true;
      vb[0] = drag.vb[0] - dx; vb[1] = drag.vb[1] - dy; clamp(); setVB();
    });
    window.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("wheel", function (e) {
      if (!e.ctrlKey && !e.metaKey) return; // обычная прокрутка страницы не мешает
      e.preventDefault(); var u = toUser(e); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, u[0], u[1]);
    }, { passive: false });

    svg.addEventListener("click", function (e) {
      if (moved) return;
      var k = e.target.getAttribute && e.target.getAttribute("data-key");
      if (k) select(k, { scroll: true });
    });
    svg.addEventListener("keydown", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-key");
      if (k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(k, { force: true }); }
    });
    svg.addEventListener("mousemove", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-key");
      if (!k || !P[k]) { tip.classList.remove("is-visible"); return; }
      var r = stage.getBoundingClientRect();
      tip.textContent = P[k].name;
      tip.style.left = (e.clientX - r.left) + "px"; tip.style.top = (e.clientY - r.top) + "px";
      tip.classList.add("is-visible");
    });
    svg.addEventListener("mouseleave", function () { tip.classList.remove("is-visible"); });

    var showAll = false;
    host.querySelectorAll("[data-map-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-map-action");
        if (a === "in") zoom(1 / 1.4);
        if (a === "out") zoom(1.4);
        if (a === "reset") { vb = vb0.slice(); setVB(); svg.classList.toggle("show-minor", showAll); }
        if (a === "cities") { showAll = !showAll; b.setAttribute("aria-pressed", String(showAll)); svg.classList.toggle("show-minor", showAll || vb[2] < 640); }
      });
    });

    panel.addEventListener("click", function (e) {
      var a = e.target.closest("[data-goto]"); if (!a) return;
      var tabBtn = document.querySelector('.tab[aria-controls="tab-' + a.getAttribute("data-goto") + '"]');
      if (tabBtn) tabBtn.click();
    });
    document.querySelectorAll("[data-show-on-map]").forEach(function (b) {
      b.addEventListener("click", function () {
        select(b.getAttribute("data-show-on-map"), { force: true });
        host.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
    var h = (location.hash || "").slice(1);
    if (pieceByKey[h]) { select(h, { force: true }); setTimeout(function () { host.scrollIntoView(); }, 50); }
  }

  /* ---------------------------------------------------------------
     3. Мини-карта (для вопросов теста)
     --------------------------------------------------------------- */
  window.RusMiniMap = function (key) {
    var svg = svgRoot([0, -10, 870, 1060], "map-svg", "Карта русских земель, одна из них выделена");
    keys().forEach(function (k) {
      var on = k === key;
      el("path", { d: M.principalities[k].d, class: "m-piece" + (on ? " is-active" : ""), style: "--c:" + (on ? "var(--cinnabar)" : "var(--line-strong)") + ";cursor:default" }, svg);
    });
    var gW = el("g", null, svg);
    M.water.forEach(function (d) { el("path", { d: d, class: "m-water" }, gW); });
    return svg;
  };

  document.querySelectorAll("[data-map='hero']").forEach(heroMap);
  document.querySelectorAll("[data-map='full']").forEach(fullMap);
})();
