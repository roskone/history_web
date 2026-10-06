/* «Зимний путь»: карта маршрута, рельс-навигация, летопись-свиток, игра, документы, карточки, сопоставление. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var M = window.ZP_MAP, C = window.ZP || {};
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ---------- Тема и меню ---------- */
  var tb = document.querySelector(".theme");
  if (tb) tb.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next); store("zp-theme", next);
  });
  var burger = document.querySelector(".burger"), nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () { var o = !nav.classList.contains("open"); nav.classList.toggle("open", o); burger.setAttribute("aria-expanded", String(o)); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); } });
  }

  /* ---------- Карта маршрута ---------- */
  // Точки маршрута в координатах карты: санный путь по рекам и волокам
  var LEGS = [
    { from: "kiev", to: "chernigov", pts: [[326, 918], [333, 899], [348, 878], [362, 857]] },
    { from: "chernigov", to: "smolensk", pts: [[362, 857], [351, 842], [355, 812], [366, 778], [384, 742], [401, 692]] },
    { from: "smolensk", to: "novgorod", pts: [[401, 692], [388, 668], [376, 640], [386, 606], [398, 568], [404, 530], [408, 494]] },
    { from: "novgorod", to: "vladimir", pts: [[408, 494], [436, 520], [470, 556], [500, 578], [530, 592], [570, 590], [611, 597], [629, 612], [659, 630]] }
  ];
  var STOPS = [
    { key: "kiev", name: "Киев", x: 326.4, y: 918.7, a: "l" },
    { key: "chernigov", name: "Чернигов", x: 362.3, y: 856.7, a: "r" },
    { key: "smolensk", name: "Смоленск", x: 401.4, y: 692.1, a: "r" },
    { key: "novgorod", name: "Новгород", x: 408.3, y: 494.2, a: "r" },
    { key: "vladimir", name: "Владимир", x: 658.6, y: 630.0, a: "r" }
  ];
  var GALICH = { x: 128, y: 962.9 };
  function smooth(pts) {
    var d = "M" + pts[0][0] + "," + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += " C" + c1[0].toFixed(1) + "," + c1[1].toFixed(1) + " " + c2[0].toFixed(1) + "," + c2[1].toFixed(1) + " " + p2[0] + "," + p2[1];
    }
    return d;
  }
  var ROUTE_D = smooth(LEGS.reduce(function (a, l, i) { return a.concat(i ? l.pts.slice(1) : l.pts); }, []));

  function routeMap(host, opts) {
    var vb = opts.vb || [90, 440, 700, 560];
    var svg = el("svg", { viewBox: vb.join(" "), class: "rmap", role: "img", "aria-label": opts.label });
    el("rect", { x: vb[0] - 50, y: vb[1] - 50, width: vb[2] + 100, height: vb[3] + 100, class: "land" }, svg);
    var tints = {};
    Object.keys(M.principalities).forEach(function (k) {
      if (STOPS.some(function (s) { return s.key === k; }) || k === "galich") tints[k] = el("path", { d: M.principalities[k].d, class: "tint" }, svg);
    });
    M.water.forEach(function (d) { el("path", { d: d, class: "water" }, svg); });
    M.rivers.forEach(function (d) { el("path", { d: d, class: "river" }, svg); });
    Object.keys(M.principalities).forEach(function (k) { el("path", { d: M.principalities[k].d, class: "border" }, svg); });
    var fs = opts.small ? 26 : 17;
    if (!opts.small) {
      [["Половецкая степь", 560, 985], ["Балтийское море", 160, 480]].forEach(function (t) {
        var x = el("text", { x: t[1], y: t[2], class: t[0].indexOf("море") > -1 ? "sea" : "lbl", "font-size": 12, "text-anchor": "middle" }, svg); x.textContent = t[0];
      });
    }
    el("path", { d: smooth([[128, 963], [220, 952], [290, 935], [326, 919]]), class: "letter-route" }, svg);
    el("path", { d: ROUTE_D, class: "route-ghost" }, svg);
    var route = el("path", { d: ROUTE_D, class: "route" }, svg);
    var stopEls = {};
    STOPS.forEach(function (s, i) {
      var g = el("a", { href: "#" + s.key, class: "stop", "aria-label": "Стоянка " + (i + 1) + ": " + s.name }, svg);
      el("circle", { cx: s.x, cy: s.y, r: opts.small ? 9 : 7 }, g);
      var dx = s.a === "l" ? -14 : 14;
      var t = el("text", { x: s.x + dx, y: s.y + fs * .35, "text-anchor": s.a === "l" ? "end" : "start", "font-size": fs }, g);
      t.textContent = s.name;
      if (!opts.small) { var n = el("text", { x: s.x + dx, y: s.y - fs * .75, "text-anchor": s.a === "l" ? "end" : "start", "font-size": 11, class: "n" }, g); n.textContent = "стоянка " + (i + 1); }
      stopEls[s.key] = g;
    });
    var gg = el("a", { href: "#galich", class: "stop", "aria-label": "Письмо из Галича" }, svg);
    el("circle", { cx: GALICH.x, cy: GALICH.y, r: opts.small ? 8 : 6, style: "stroke:var(--amber)" }, gg);
    var gt = el("text", { x: GALICH.x + 12, y: GALICH.y - 10, "font-size": fs * .9 }, gg); gt.textContent = "Галич";
    host.appendChild(svg);
    var len = 1000;
    try { len = route.getTotalLength() || 1000; } catch (err) { /* скрытый SVG в некоторых браузерах */ }
    route.style.setProperty("--len", len);
    return { svg: svg, route: route, len: len, tints: tints, stops: stopEls };
  }

  var hero = document.querySelector("[data-route-hero]");
  if (hero) {
    var hm = routeMap(hero, { label: "Карта маршрута купца: Киев, Чернигов, Смоленск, Новгород, Владимир; письмо из Галича" });
    STOPS.forEach(function (s) { if (hm.tints[s.key]) hm.tints[s.key].classList.add("on"); });
    if (!reduce) hm.svg.classList.add("draw");
  }

  /* ---------- Рельс: мини-карта и оглавление следят за чтением ---------- */
  var railMapHost = document.querySelector("[data-route-rail]");
  var rail = railMapHost ? routeMap(railMapHost, { small: true, vb: [90, 440, 700, 560], label: "Мини-карта: где сейчас купец" }) : null;
  if (rail) { rail.route.style.strokeDasharray = rail.len; rail.route.style.strokeDashoffset = rail.len; rail.route.style.transition = reduce ? "none" : "stroke-dashoffset .6s ease"; }
  var stopLen = {};
  if (rail) {
    // длина пути до каждой стоянки — для частичной прорисовки
    var acc = 0, tmp = el("path", {}, rail.svg);
    stopLen.kiev = 0;
    LEGS.forEach(function (l, i) {
      tmp.setAttribute("d", smooth(l.pts));
      try { acc += tmp.getTotalLength(); } catch (err) { acc = rail.len * (i + 1) / LEGS.length; }
      stopLen[l.to] = acc;
    });
    tmp.remove();
  }
  var chapters = Array.prototype.slice.call(document.querySelectorAll("[data-ch]"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".chapters a, .top nav a"));
  var now = document.querySelector("[data-rail-now]");
  function setActive(sec) {
    var id = sec.id, idx = chapters.indexOf(sec);
    links.forEach(function (a) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      a.classList.toggle("is-active", t === sec);
      if (a.closest(".chapters")) a.classList.toggle("passed", chapters.indexOf(t) < idx && a.classList.contains("stop"));
    });
    // последняя пройденная стоянка
    var lastStop = null, n = 0;
    chapters.slice(0, idx + 1).forEach(function (c) { if (c.hasAttribute("data-stop")) { lastStop = c.getAttribute("data-stop"); } });
    STOPS.forEach(function (s, i) {
      var passed = lastStop && i <= STOPS.map(function (x) { return x.key; }).indexOf(lastStop);
      if (rail) rail.stops[s.key].classList.toggle("done", !!passed);
      if (rail && rail.tints[s.key]) { rail.tints[s.key].classList.toggle("on", !!passed); rail.tints[s.key].classList.toggle("here", s.key === lastStop && sec.getAttribute("data-stop") === s.key); }
      if (passed) n = i + 1;
    });
    if (rail && rail.tints.galich) rail.tints.galich.classList.toggle("here", id === "galich");
    if (rail) rail.route.style.strokeDashoffset = Math.max(0, rail.len - (lastStop ? stopLen[lastStop] : 0));
    var mnow = document.querySelector("[data-mnow]");
    if (mnow) { mnow.classList.toggle("show", idx >= 0 && sec.id !== "prolog"); }
    if (now) {
      var v = sec.getAttribute("data-versts");
      now.innerHTML = lastStop ? "<b>Стоянка " + n + " из 5 · " + esc(STOPS[n - 1].name) + "</b>" + (v ? "пройдено ≈ " + v + " вёрст" : "") : "<b>Перед дорогой</b>Киев, зима 1166 года";
      if (id === "galich") now.innerHTML = "<b>Письмо из Галича</b>весть от брата Нежаты";
      if (idx > chapters.indexOf(document.getElementById("vladimir")) && id !== "galich") now.innerHTML = "<b>Путь окончен</b>≈ " + (document.getElementById("vladimir").getAttribute("data-versts") || "") + " вёрст за зиму";
      if (mnow) mnow.innerHTML = now.innerHTML.replace("</b>", "</b> · ");
    }
  }
  if ("IntersectionObserver" in window && chapters.length) {
    var vis = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
      var first = chapters.filter(function (c) { return vis[c.id]; })[0];
      if (first) setActive(first);
    }, { rootMargin: "-30% 0px -60% 0px" });
    chapters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Узлы причин ---------- */
  document.querySelectorAll(".knot > button").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.parentNode, open = !k.classList.contains("open");
      k.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open));
      k.querySelector(".k-body").hidden = !open;
    });
  });
  var untie = document.querySelector("[data-untie]");
  if (untie) untie.addEventListener("click", function () {
    var all = document.querySelectorAll(".knot"), anyClosed = Array.prototype.some.call(all, function (k) { return !k.classList.contains("open"); });
    all.forEach(function (k) { k.classList.toggle("open", anyClosed); k.querySelector("button").setAttribute("aria-expanded", String(anyClosed)); k.querySelector(".k-body").hidden = !anyClosed; });
    untie.textContent = anyClosed ? "Завязать все узлы" : "Развязать все узлы";
  });

  /* ---------- Летопись-свиток ---------- */
  var sc = document.querySelector("[data-scroll]");
  if (sc && C.timeline) {
    var Y0 = 1040, Y1 = 1535, PX = 12, W = (Y1 - Y0) * PX + 80;
    var inner = sc.querySelector(".scroll-inner");
    inner.style.width = W + "px";
    var xOf = function (y) { return 40 + (y - Y0) * PX; };
    var html = ['<div class="axis"></div>'];
    for (var y = 1050; y <= 1530; y += 10) html.push('<div class="tick" style="left:' + xOf(y) + 'px"><span>' + (y % 50 === 0 ? y : "") + "</span></div>");
    [[1054, 1132, "Русь Ярославичей"], [1132, 1237, "Удельная Русь"], [1237, 1325, "Нашествие и Орда"], [1325, 1521, "Собирание земель вокруг Москвы"]].forEach(function (e) {
      html.push('<div class="era-band" style="left:' + xOf(e[0]) + "px;width:" + (xOf(e[1]) - xOf(e[0])) + 'px">' + e[2] + "</div>");
    });
    var lanes = [-1e9, -1e9, -1e9, -1e9], STEMS = [16, 122, 16, 122], alt = false;
    var LAND = { all: "var(--spruce-3)", kiev: "#b9472f", chernigov: "#7a5c94", smolensk: "#b8962f", novgorod: "#4f7f6a", vladimir: "#3f6e9c", galich: "#a8711f", ryazan: "#7f9348", polotsk: "#b46a5c", moscow: "#8a3b52", horde: "#555" };
    C.timeline.slice().sort(function (a, b) { return a.year - b.year; }).forEach(function (e) {
      var x = xOf(e.year), best = 0, gap = -1e9;
      var order = (alt = !alt) ? [0, 2, 1, 3] : [2, 0, 3, 1];
      for (var oi = 0; oi < 4; oi++) { var i = order[oi], g = x - lanes[i]; if (g >= 200) { best = i; gap = g; break; } if (g > gap) { gap = g; best = i; } }
      lanes[best] = x;
      var up = best < 2, stem = STEMS[best];
      var pos = up ? "bottom:" + (470 - 232 + stem) + "px" : "top:" + (236 + stem) + "px";
      html.push('<div class="ev ' + (up ? "up" : "down") + '" data-kind="' + esc(e.kind) + '" style="left:' + x + "px;" + pos + ";--stem:" + stem + "px;--c:" + (LAND[e.land] || LAND.all) + '"><i class="dot"></i>' +
        '<div class="ev-card"><b>' + e.year + "</b><strong>" + esc(e.title) + "</strong><span>" + esc(e.text) + "</span></div></div>");
    });
    inner.innerHTML = html.join("");
    // перетаскивание мышью
    var down = null;
    sc.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = { x: e.clientX, s: sc.scrollLeft }; sc.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (down) sc.scrollLeft = down.s - (e.clientX - down.x); });
    window.addEventListener("pointerup", function () { down = null; sc.classList.remove("dragging"); });
    document.querySelectorAll("[data-scroll-btn]").forEach(function (b) {
      b.addEventListener("click", function () { sc.scrollBy({ left: +b.getAttribute("data-scroll-btn") * sc.clientWidth * .8, behavior: reduce ? "auto" : "smooth" }); });
    });
    document.querySelectorAll("[data-jump]").forEach(function (b) {
      b.addEventListener("click", function () { sc.scrollTo({ left: xOf(+b.getAttribute("data-jump")) - 40, behavior: reduce ? "auto" : "smooth" }); });
    });
    var kf = document.querySelector("[data-kind-filter]");
    if (kf) kf.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var k = b.getAttribute("data-k");
      kf.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      inner.querySelectorAll(".ev").forEach(function (ev) { ev.hidden = k !== "all" && ev.getAttribute("data-kind") !== k; });
    });
  }

  /* ---------- Игра «Ты — князь» ---------- */
  var gameHost = document.querySelector("[data-game]");
  if (gameHost && C.game) {
    var gi = 0, score = 0, picks = [];
    var card = gameHost.querySelector(".g-card"), knob = gameHost.querySelector(".meter i"), steps = gameHost.querySelector(".g-steps");
    steps.innerHTML = C.game.map(function () { return "<i></i>"; }).join("");
    var maxS = C.game.length;
    function meter() { knob.style.left = (50 + score / maxS * 50) + "%"; steps.querySelectorAll("i").forEach(function (s, i) { s.classList.toggle("on", i < gi || (i === gi && picks[gi] != null)); }); }
    function renderG() {
      var s = C.game[gi];
      card.innerHTML = '<div class="g-meta">' + s.year + " · " + esc(s.place) + " · ход " + (gi + 1) + " из " + C.game.length + '</div><p class="g-sit">' + esc(s.situation) + '</p><div class="g-opts">' +
        s.options.map(function (o, i) { return '<button class="g-opt" type="button" data-i="' + i + '"><span class="l">' + "абв"[i] + ')</span><span>' + esc(o.text) + "</span></button>"; }).join("") + '</div><div data-out aria-live="polite"></div>';
      meter();
    }
    card.addEventListener("click", function (e) {
      var b = e.target.closest(".g-opt");
      if (b && !b.disabled) {
        var s = C.game[gi], o = s.options[+b.getAttribute("data-i")];
        picks[gi] = +b.getAttribute("data-i"); score += o.score;
        card.querySelectorAll(".g-opt").forEach(function (x, i) {
          x.disabled = true;
          if (s.options[i].historical) x.insertAdjacentHTML("beforeend", '<span class="hist">так было в истории</span>');
        });
        b.classList.add("chosen");
        card.querySelector("[data-out]").innerHTML = '<div class="g-out"><p>' + esc(o.outcome) + '</p><p class="lesson">' + esc(s.lesson) + '</p></div><div class="g-actions"><button class="btn btn-main" type="button" data-next>' + (gi < C.game.length - 1 ? "Следующий ход →" : "Подвести итог") + "</button></div>";
        meter();
        card.querySelector("[data-next]").focus();
        return;
      }
      if (e.target.closest("[data-next]")) {
        gi++;
        if (gi < C.game.length) renderG(); else finalG();
        gameHost.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
      if (e.target.closest("[data-again]")) { gi = 0; score = 0; picks = []; renderG(); }
    });
    function finalG() {
      var r = (C.results || []).filter(function (x) { return score >= x.min && score <= x.max; })[0] || { title: "Путь пройден", text: "" };
      var hist = picks.filter(function (p, i) { return C.game[i].options[p].historical; }).length;
      card.innerHTML = '<div class="g-final"><div class="g-meta">Итог · очки единства: ' + (score > 0 ? "+" : "") + score + '</div><h3>' + esc(r.title) + "</h3><p>" + esc(r.text) + '</p><p class="mono" style="font-size:.85rem;color:var(--spruce-3)">Совпало с реальной историей: ' + hist + " из " + C.game.length + '</p><div class="g-actions" style="justify-content:flex-start"><button class="btn btn-main" type="button" data-again>Сыграть ещё раз</button></div></div>';
      meter();
    }
    renderG();
  }

  /* ---------- Дорожная сумка: документы ---------- */
  var bag = document.querySelector("[data-bag]");
  if (bag) {
    var tabs = Array.prototype.slice.call(bag.querySelectorAll(".bag-list button"));
    function openDoc(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { openDoc(t); });
      t.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (j !== null) { e.preventDefault(); openDoc(tabs[j], true); }
      });
    });
    var h = (location.hash || "").slice(1), byHash = tabs.filter(function (t) { return t.getAttribute("aria-controls") === "doc-" + h; })[0];
    openDoc(byHash || tabs[0]);
    if (byHash) setTimeout(function () { bag.scrollIntoView(); }, 50);
    bag.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mode]"); if (!b) return;
      var par = b.closest(".bag-doc").querySelector(".parallel");
      par.classList.remove("mode-orig", "mode-trans"); par.classList.add("mode-" + b.getAttribute("data-mode"));
      b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  }

  /* ---------- Карточки-перевёртыши ---------- */
  document.querySelectorAll(".flip").forEach(function (f) {
    f.addEventListener("click", function () { var on = !f.classList.contains("on"); f.classList.toggle("on", on); f.setAttribute("aria-pressed", String(on)); });
  });

  /* ---------- Сопоставление «Собери Русь» ---------- */
  var pz = document.querySelector("[data-puzzle]");
  if (pz && C.puzzle) {
    var rowsHost = pz.querySelector(".pz-rows"), res = pz.querySelector(".pz-res");
    function shuffled(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (i * 7 + 3) % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var caps = shuffled(C.puzzle.map(function (r) { return r.capital; }));
    var pows = shuffled(C.puzzle.map(function (r) { return r.power; })).reverse();
    function opt(list, label) { return '<option value="">' + label + "</option>" + list.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join(""); }
    function build() {
      rowsHost.innerHTML = C.puzzle.map(function (r, i) {
        return '<div class="pz-row" data-i="' + i + '"><b>' + esc(r.land) + '</b><label class="visually-hidden" for="pz-c' + i + '">Центр: ' + esc(r.land) + '</label><select id="pz-c' + i + '">' + opt(caps, "Выберите центр…") + '</select><label class="visually-hidden" for="pz-p' + i + '">Устройство власти: ' + esc(r.land) + '</label><select id="pz-p' + i + '">' + opt(pows, "Выберите устройство власти…") + "</select></div>";
      }).join("");
      res.textContent = "";
    }
    build();
    pz.querySelector("[data-check]").addEventListener("click", function () {
      var ok = 0;
      rowsHost.querySelectorAll(".pz-row").forEach(function (row) {
        var r = C.puzzle[+row.getAttribute("data-i")], s = row.querySelectorAll("select");
        var good = s[0].value === r.capital && s[1].value === r.power;
        row.classList.toggle("ok", good); row.classList.toggle("bad", !good); if (good) ok++;
      });
      res.textContent = ok === C.puzzle.length ? "Всё верно: Русь собрана!" : "Верно: " + ok + " из " + C.puzzle.length + ". Красные строки исправьте и проверьте ещё раз.";
    });
    pz.querySelector("[data-reset]").addEventListener("click", build);
  }

  /* ---------- Лайтбокс ---------- */
  var lb;
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".fig-btn"); if (!b) return;
    var img = b.querySelector("img"), cap = b.closest("figure").querySelector("figcaption");
    if (!lb) {
      lb = document.createElement("dialog"); lb.className = "lb";
      lb.innerHTML = '<button class="tbtn" type="button" aria-label="Закрыть">✕</button><img alt=""><p></p>';
      document.body.appendChild(lb);
      lb.querySelector("button").addEventListener("click", function () { lb.close(); });
      lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.close(); });
    }
    lb.querySelector("img").src = img.src; lb.querySelector("img").alt = img.alt;
    lb.querySelector("p").textContent = cap ? cap.firstChild.textContent.trim() : "";
    lb.showModal ? lb.showModal() : window.open(img.src);
  });
})();
