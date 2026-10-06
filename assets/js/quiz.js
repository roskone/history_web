/* Тест «Феодальная раздробленность на Руси»: 15 вопросов, оценка и разбор. */
(function () {
  "use strict";
  var host = document.querySelector("[data-quiz]");
  if (!host) return;
  var P = window.PRINCIPALITIES || {};

  // Правильный ответ — всегда первый в списке; варианты перемешиваются при показе.
  var QUESTIONS = [
    { q: "В каком году умер Мстислав Великий — событие, с которого принято отсчитывать раздробленность?", a: ["1132", "1054", "1097", "1237"], e: "После смерти Мстислава Великого в 1132 году князья перестали подчиняться Киеву.", link: "hod.html#y1132" },
    { q: "Какой принцип провозгласил Любечский съезд 1097 года?", a: ["«Каждый да держит отчину свою»", "«Власть переходит к старшему в роде по лестнице»", "«Князя приглашает вече по договору»", "«Все земли подчиняются Москве»"], e: "Съезд закрепил за каждой ветвью рода земли её отца — отчину.", link: "dokumenty.html#lyubech" },
    { q: "Кого называли «изгоем» в эпоху Ярославичей?", a: ["Князя, лишившегося права на престол", "Купца, изгнанного из города", "Беглого холопа", "Монаха-отшельника"], e: "Изгоями становились сыновья князей, умерших раньше, чем они успели занять старший стол.", link: "prichiny.html#lestvica" },
    { q: "Что из перечисленного НЕ было причиной раздробленности?", a: ["Монгольское нашествие", "Натуральное хозяйство", "Рост боярских вотчин", "Упадок пути «из варяг в греки»"], e: "Нашествие началось в 1237 году — через сто лет после начала раздробленности.", link: "prichiny.html#prichiny" },
    { type: "map", key: "galich", q: "Какая земля выделена на карте?", a: ["Галицко-Волынское княжество", "Полоцкое княжество", "Смоленское княжество", "Турово-Пинское княжество"], e: "Галицко-Волынское княжество лежало на юго-западе Руси, у Карпат.", link: "knyazhestva.html#galich" },
    { q: "Какой орган был высшим органом власти в Новгороде?", a: ["Вече", "Боярская дума", "Князь", "Земский собор"], e: "Вече избирало посадника и тысяцкого, приглашало и изгоняло князей.", link: "knyazhestva.html#tab-novgorod" },
    { q: "Кто из князей сделал столицей Владимир-на-Клязьме?", a: ["Андрей Боголюбский", "Юрий Долгорукий", "Ярослав Мудрый", "Даниил Галицкий"], e: "Андрей Боголюбский перенёс столицу во Владимир в 1157 году.", link: "knyazya.html#bogolyubsky" },
    { type: "image", img: "assets/img/portrait-vsevolod.jpg", q: "Этот князь получил прозвище за многочисленную семью — у него было двенадцать детей. Кто это?", a: ["Всеволод Большое Гнездо", "Иван Калита", "Ярослав Осмомысл", "Олег Гориславич"], e: "Всеволод Юрьевич, великий князь владимирский в 1176–1212 годах.", link: "knyazya.html#vsevolod" },
    { q: "Под каким годом в летописи впервые упоминается Москва?", a: ["1147", "1136", "1169", "1223"], e: "Юрий Долгорукий позвал союзника: «Приди ко мне, брате, в Москов».", link: "dokumenty.html#moskva" },
    { type: "order", q: "Расположите события в хронологическом порядке — от раннего к позднему.", items: [
      ["Любечский съезд", 1097], ["Смерть Мстислава Великого", 1132], ["Изгнание князя из Новгорода", 1136], ["Взятие Киева войсками Андрея Боголюбского", 1169], ["Битва на Калке", 1223]
    ], e: "1097 → 1132 → 1136 → 1169 → 1223.", link: "hod.html#lenta" },
    { q: "Какой памятник литературы призывает князей к единству перед лицом половцев?", a: ["«Слово о полку Игореве»", "«Русская правда»", "«Повесть о разорении Рязани Батыем»", "«Хождение за три моря»"], e: "Автор «Слова» осуждает раздоры князей: «Это моё, и то моё же».", link: "dokumenty.html#slovo" },
    { q: "Кто из русских князей принял королевскую корону от папы римского?", a: ["Даниил Галицкий", "Роман Мстиславич", "Александр Невский", "Андрей Боголюбский"], e: "Даниил Романович был коронован в Дорогичине в 1253 году.", link: "knyazya.html#daniil" },
    { type: "map", key: "ryazan", q: "Эта земля первой приняла удар Батыя в декабре 1237 года. Как она называется?", a: ["Муромо-Рязанская земля", "Владимиро-Суздальское княжество", "Черниговское княжество", "Киевское княжество"], e: "Рязань пала 21 декабря 1237 года — владимирский князь не прислал помощи.", link: "dokumenty.html#ryazan" },
    { q: "Что из перечисленного — положительное последствие раздробленности?", a: ["Расцвет местных культурных центров", "Ослабление обороноспособности", "Междоусобные войны", "Потеря западных земель"], e: "Каждая земля строила свои храмы и вела свои летописи.", link: "posledstviya.html#kultura" },
    { q: "«А без посадника тебе, князь, суда не судить, волостей не раздавать…» — из какого документа эти слова?", a: ["Договор Новгорода с князем (ряд)", "Завещание Ярослава Мудрого", "Решение Любечского съезда", "«Поучение» Владимира Мономаха"], e: "Новгородская договорная грамота строго ограничивала власть приглашённого князя.", link: "dokumenty.html#ryad" }
  ];
  var LETTERS = ["а", "б", "в", "г"];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var state;
  function start() {
    state = { i: 0, score: 0, answers: [], order: QUESTIONS.map(function (q) { return q.type === "order" ? shuffle(q.items) : shuffle(q.a.map(function (t, k) { return { t: t, ok: k === 0 }; })); }) };
    renderQ();
  }

  function top() {
    var pct = state.i / QUESTIONS.length * 100;
    return '<div class="quiz-top"><span>Вопрос ' + (state.i + 1) + " из " + QUESTIONS.length + '</span><span class="quiz-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span><span>Верно: ' + state.score + "</span></div>";
  }

  function renderQ() {
    var q = QUESTIONS[state.i], opts = state.order[state.i];
    var media = "";
    if (q.type === "image") media = '<div class="q-media"><img src="' + q.img + '" alt="Портрет князя из «Царского титулярника»"></div>';
    if (q.type === "map") media = '<div class="q-media" data-mini></div>';
    var body;
    if (q.type === "order") {
      body = '<ol class="q-order" data-order>' + opts.map(function (it, k) {
        return '<li data-y="' + it[1] + '"><span class="pos">' + (k + 1) + '</span><span class="txt">' + esc(it[0]) + '</span><span class="mv">' +
          '<button class="icon-btn" type="button" data-mv="-1" aria-label="Поднять «' + esc(it[0]) + '» выше">↑</button>' +
          '<button class="icon-btn" type="button" data-mv="1" aria-label="Опустить «' + esc(it[0]) + '» ниже">↓</button></span></li>';
      }).join("") + "</ol>" +
        '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>Проверить порядок</button></div>';
    } else {
      body = '<div class="q-options" role="group" aria-label="Варианты ответа">' + opts.map(function (o, k) {
        return '<button class="q-opt" type="button" data-k="' + k + '"><span class="letter" aria-hidden="true">' + LETTERS[k] + "</span><span>" + esc(o.t) + "</span></button>";
      }).join("") + "</div>";
    }
    host.innerHTML = top() + '<div class="q-card"><div class="q-num">Вопрос ' + (state.i + 1) + '</div><h2 class="q-text" tabindex="-1">' + esc(q.q) + "</h2>" + media + body + '<div data-fb aria-live="polite"></div></div>';
    if (q.type === "map" && window.RusMiniMap) host.querySelector("[data-mini]").appendChild(window.RusMiniMap(q.key));
    var h = host.querySelector(".q-text");
    if (state.i > 0) h.focus({ preventScroll: true });
  }

  function feedback(ok, q) {
    var fb = host.querySelector("[data-fb]");
    var last = state.i === QUESTIONS.length - 1;
    fb.innerHTML = '<div class="q-feedback ' + (ok ? "ok" : "bad") + '"><b>' + (ok ? "Верно! " : "Неверно. ") + "</b>" + q.e +
      ' <a href="' + q.link + '">Подробнее</a></div>' +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-next>' + (last ? "Узнать результат" : "Следующий вопрос →") + "</button></div>";
    fb.querySelector("[data-next]").focus();
  }

  host.addEventListener("click", function (e) {
    var q = QUESTIONS[state && state.i];
    var opt = e.target.closest(".q-opt");
    if (opt && !opt.disabled) {
      var k = +opt.getAttribute("data-k"), chosen = state.order[state.i][k];
      host.querySelectorAll(".q-opt").forEach(function (b, j) {
        b.disabled = true;
        if (state.order[state.i][j].ok) b.classList.add("is-correct");
      });
      if (!chosen.ok) opt.classList.add("is-wrong");
      if (chosen.ok) state.score++;
      state.answers.push({ q: q.q, ok: chosen.ok, given: chosen.t, right: q.a[0] });
      feedback(chosen.ok, q);
      return;
    }
    var mv = e.target.closest("[data-mv]");
    if (mv) {
      var li = mv.closest("li"), list = li.parentNode, dir = +mv.getAttribute("data-mv");
      if (dir < 0 && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      if (dir > 0 && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      list.querySelectorAll(".pos").forEach(function (p, j) { p.textContent = j + 1; });
      mv.focus();
      return;
    }
    if (e.target.closest("[data-check]")) {
      var lis = Array.prototype.slice.call(host.querySelectorAll("[data-order] li"));
      var years = lis.map(function (l) { return +l.getAttribute("data-y"); });
      var ok = years.every(function (y, j) { return j === 0 || years[j - 1] <= y; });
      lis.forEach(function (l, j) {
        var sorted = years.slice().sort(function (a, b) { return a - b; });
        l.classList.add(+l.getAttribute("data-y") === sorted[j] ? "is-correct" : "is-wrong");
        l.querySelector(".mv").innerHTML = '<span class="yr">' + l.getAttribute("data-y") + "</span>";
      });
      e.target.closest(".q-actions").remove();
      if (ok) state.score++;
      state.answers.push({ q: q.q, ok: ok, given: ok ? "верный порядок" : "порядок с ошибками", right: q.e });
      feedback(ok, q);
      return;
    }
    if (e.target.closest("[data-next]")) {
      state.i++;
      if (state.i < QUESTIONS.length) renderQ(); else result();
      host.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (e.target.closest("[data-restart]")) { start(); host.scrollIntoView({ block: "start" }); }
  });

  function result() {
    var s = state.score, n = QUESTIONS.length;
    var grade = s >= 13 ? 5 : s >= 10 ? 4 : s >= 7 ? 3 : 2;
    var note = {
      5: "Отлично! Летописец гордился бы таким знанием истории.",
      4: "Хорошо! Загляните в разбор — и в следующий раз будет «пятёрка».",
      3: "Есть пробелы. Перечитайте разделы, на которые ведут ссылки в разборе.",
      2: "Стоит вернуться к разделам «Причины» и «Ход событий» и попробовать снова."
    }[grade];
    host.innerHTML = '<div class="q-card q-result">' +
      '<div class="q-num">Ваша оценка</div><div class="q-grade" aria-label="Оценка ' + grade + '">' + grade + "</div>" +
      '<p class="q-score">Правильных ответов: <b>' + s + " из " + n + "</b></p><p>" + note + "</p>" +
      '<div class="q-actions" style="justify-content:center"><button class="btn btn-primary" type="button" data-restart>Пройти ещё раз</button><a class="btn btn-ghost" href="istochniki.html">К источникам</a></div>' +
      '<div class="q-review">' + state.answers.map(function (a, j) {
        return "<div><span class=\"" + (a.ok ? "ok-mark" : "bad-mark") + "\">" + (a.ok ? "✓" : "✗") + "</span><span><b>" + (j + 1) + ".</b> " + esc(a.q) +
          (a.ok ? "" : '<br><span class="muted">Правильно: ' + esc(a.right) + "</span>") + "</span></div>";
      }).join("") + "</div></div>";
    var g = host.querySelector(".q-grade"); g.setAttribute("tabindex", "-1"); g.focus({ preventScroll: true });
  }

  start();
})();
