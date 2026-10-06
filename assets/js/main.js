/* Общие скрипты сайта: тема, меню, оглавление, подсказки-термины, лайтбокс, вкладки. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* --- Тема --- */
  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("theme", next);
      themeBtn.setAttribute("aria-label", next === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
    });
  }

  /* --- Мобильное меню --- */
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
  }

  /* --- Прогресс чтения и кнопка «наверх» --- */
  var bar = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY || window.pageYOffset;
    if (bar) bar.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + "%";
    if (toTop) toTop.classList.toggle("is-visible", y > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* --- Оглавление страницы с подсветкой текущего раздела --- */
  var toc = document.querySelector(".toc[data-auto]");
  if (toc) {
    var list = toc.querySelector("ol");
    var sections = Array.prototype.slice.call(document.querySelectorAll(".article > section[id]"));
    sections.forEach(function (s) {
      var h = s.querySelector(".section-title");
      if (!h) return;
      var li = document.createElement("li");
      li.innerHTML = '<a href="#' + s.id + '">' + (h.getAttribute("data-short") || h.textContent) + "</a>";
      list.appendChild(li);
    });
    var links = list.querySelectorAll("a");
    if ("IntersectionObserver" in window) {
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
        var firstVisible = sections.filter(function (s) { return visible[s.id]; })[0];
        if (!firstVisible) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + firstVisible.id); });
      }, { rootMargin: "-80px 0px -55% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* --- Точки-«уделы» на главной --- */
  document.querySelectorAll("[data-dots]").forEach(function (d) {
    d.innerHTML = new Array(+d.getAttribute("data-dots") + 1).join("<i></i>");
  });

  /* --- Плавное появление блоков --- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (r) { ro.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("is-visible"); });

  /* --- Термины с подсказками --- */
  var G = window.GLOSSARY || {};
  var pop = null, popFor = null;
  function closePop() {
    if (pop) { pop.remove(); pop = null; }
    if (popFor) { popFor.setAttribute("aria-expanded", "false"); popFor = null; }
  }
  function openPop(btn) {
    var key = btn.getAttribute("data-term");
    var item = G[key];
    if (!item) return;
    closePop();
    pop = document.createElement("div");
    pop.className = "term-pop"; pop.id = "term-pop"; pop.setAttribute("role", "tooltip");
    pop.innerHTML = "<strong>" + item.t + "</strong>" + item.d;
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect();
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var left = Math.min(Math.max(16, r.left + window.scrollX + r.width / 2 - pw / 2), window.scrollX + document.documentElement.clientWidth - pw - 16);
    var top = r.top + window.scrollY - ph - 10;
    if (r.top - ph - 10 < 70) top = r.bottom + window.scrollY + 10;
    pop.style.left = left + "px"; pop.style.top = top + "px";
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-describedby", "term-pop");
    popFor = btn;
  }
  document.querySelectorAll(".term[data-term]").forEach(function (b) {
    if (b.tagName !== "BUTTON") return;
    b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", function (e) { e.stopPropagation(); if (popFor === b) closePop(); else openPop(b); });
    b.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) openPop(b); });
    b.addEventListener("mouseleave", function () { if (window.matchMedia("(hover: hover)").matches) closePop(); });
  });
  document.addEventListener("click", function (e) { if (pop && !pop.contains(e.target)) closePop(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
  window.addEventListener("resize", closePop);

  /* --- Словарь на главной с поиском --- */
  var gl = document.querySelector("[data-glossary]");
  if (gl) {
    var keys = Object.keys(G).sort(function (a, b) { return G[a].t.localeCompare(G[b].t, "ru"); });
    gl.innerHTML = keys.map(function (k) {
      return '<div data-k="' + k + '"><dt>' + G[k].t + "</dt><dd>" + G[k].d + "</dd></div>";
    }).join("");
    var search = document.querySelector("[data-glossary-search]");
    var counter = document.querySelector("[data-glossary-count]");
    function filter() {
      var q = (search.value || "").trim().toLowerCase();
      var n = 0;
      gl.querySelectorAll("div").forEach(function (d) {
        var show = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !show; if (show) n++;
      });
      if (counter) counter.textContent = n ? "Найдено: " + n : "Ничего не найдено — попробуйте другое слово";
    }
    if (search) search.addEventListener("input", filter);
    filter();
  }

  /* --- Лайтбокс для иллюстраций --- */
  var lb = null;
  function lightbox(src, caption) {
    if (!lb) {
      lb = document.createElement("dialog");
      lb.className = "lightbox";
      lb.innerHTML = '<button class="icon-btn modal-close" type="button" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img alt=""><p></p>';
      document.body.appendChild(lb);
      lb.querySelector(".modal-close").addEventListener("click", function () { lb.close(); });
      lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    }
    lb.querySelector("img").src = src;
    lb.querySelector("img").alt = caption || "";
    lb.querySelector("p").textContent = caption || "";
    if (lb.showModal) lb.showModal(); else window.open(src, "_blank");
  }
  document.addEventListener("click", function (e) {
    var z = e.target.closest(".figure-zoom");
    if (!z) return;
    e.preventDefault();
    var img = z.querySelector("img");
    var fig = z.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    lightbox(z.getAttribute("data-full") || (img && img.currentSrc) || img.src, cap ? cap.firstChild.textContent.trim() : (img && img.alt));
  });

  /* --- Вкладки --- */
  document.querySelectorAll("[role='tablist']").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role='tab']"));
    function activate(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(x.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(t); });
      t.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); activate(tabs[j], true); }
      });
    });
    var hash = (location.hash || "").slice(1);
    var byHash = tabs.filter(function (t) { return t.getAttribute("aria-controls") === "tab-" + hash; })[0];
    activate(byHash || tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  });

  /* --- Документы: подлинник / перевод, фильтр --- */
  document.querySelectorAll(".doc").forEach(function (doc) {
    var sw = doc.querySelector(".doc-switch");
    if (!sw) return;
    sw.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var mode = b.getAttribute("data-mode");
      sw.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      doc.querySelectorAll("[data-text]").forEach(function (t) { t.hidden = t.getAttribute("data-text") !== mode; });
    });
  });
  var docFilter = document.querySelector("[data-doc-filter]");
  if (docFilter) {
    docFilter.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var f = b.getAttribute("data-filter");
      docFilter.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll(".doc").forEach(function (d) { d.hidden = f !== "all" && d.getAttribute("data-type") !== f; });
    });
  }
})();
