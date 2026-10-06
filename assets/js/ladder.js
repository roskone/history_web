/* Интерактивная схема «лествичного права»: шаг за шагом от завещания Ярослава до Любеча. */
(function () {
  "use strict";
  var root = document.querySelector("[data-ladder]");
  if (!root) return;

  var CITIES = [
    ["Киев", "старший, «златой» стол"],
    ["Чернигов", "второй по старшинству"],
    ["Переяславль", "третий"],
    ["Смоленск", "четвёртый"],
    ["Владимир-Волынский", "пятый"]
  ];
  var STEPS = [
    {
      year: "1054", title: "Завещание Ярослава",
      who: ["Изяслав", "Святослав", "Всеволод", "Вячеслав", "Игорь"],
      text: "Пятеро сыновей Ярослава получили города по старшинству. Самый почётный — киевский стол. Когда умирает старший брат, остальные сдвигаются на ступень выше.",
      out: []
    },
    {
      year: "1057", title: "Умер Вячеслав",
      who: ["Изяслав", "Святослав", "Всеволод", "Игорь", null],
      text: "Игоря перевели из Владимира-Волынского в Смоленск — лестница сработала. Но сын Вячеслава Борис остался ни с чем: его отец не успел подняться выше. Таких князей называли изгоями.",
      out: ["Борис Вячеславич"]
    },
    {
      year: "1060", title: "Умер Игорь",
      who: ["Изяслав", "Святослав", "Всеволод", "делят старшие братья", null],
      text: "Смоленск старшие братья поделили между собой, а сыновья Игоря тоже стали изгоями. Чем больше рождалось Рюриковичей, тем больше было обделённых.",
      out: ["Борис Вячеславич", "Давыд Игоревич"]
    },
    {
      year: "1073", title: "Братья изгоняют старшего",
      who: ["Святослав (силой)", "Всеволод", "Всеволод", "делят старшие братья", null],
      text: "Святослав и Всеволод обвинили Изяслава в заговоре и выгнали из Киева. Изяслав бежал в Польшу, а потом искал помощи у германского императора и римского папы. Лестница сломалась: Киев заняли не по старшинству, а силой.",
      out: ["Изяслав (в изгнании)", "Борис Вячеславич", "Давыд Игоревич"]
    },
    {
      year: "1078", title: "Битва на Нежатиной ниве",
      who: ["Всеволод", "Владимир Мономах", "Ростислав Всеволодович", null, null],
      text: "Изгои Олег Святославич и Борис Вячеславич привели половцев. В битве погибли Борис и вернувшийся в Киев Изяслав. Киев достался Всеволоду, Чернигов — его сыну Владимиру Мономаху. Олег, лишённый отцовского Чернигова, на годы стал врагом Мономаха — «Слово о полку Игореве» назовёт его Гориславичем.",
      out: ["Олег Святославич", "Давыд Игоревич"]
    },
    {
      year: "1097", title: "Любеч: каждому — своя отчина",
      who: ["Святополк Изяславич", "Давыд и Олег Святославичи", "Владимир Мономах", "сыновья Мономаха", "Давыд Игоревич"],
      text: "Князья признали, что лестница не работает. Решили: «каждый да держит отчину свою». Земли стали наследственными владениями ветвей рода — сыновья Святослава получили Чернигов, Мономах остался в Переяславле. Изгоев больше нет, но нет и единой лестницы. Это фундамент будущей раздробленности.",
      out: []
    }
  ];

  var rungs = root.querySelector("[data-ladder-rungs]");
  var yearEl = root.querySelector("[data-ladder-year]");
  var titleEl = root.querySelector("[data-ladder-title]");
  var descEl = root.querySelector("[data-ladder-desc]");
  var outEl = root.querySelector("[data-ladder-outcasts]");
  var prev = root.querySelector("[data-ladder-prev]");
  var next = root.querySelector("[data-ladder-next]");
  var pips = root.querySelector("[data-ladder-pips]");
  var NUMS = ["а҃", "в҃", "г҃", "д҃", "є҃"];
  var step = 0, last = null;

  CITIES.forEach(function (c, i) {
    var li = document.createElement("li");
    li.className = "rung";
    li.innerHTML = '<span class="rung-n" aria-hidden="true">' + NUMS[i] + '</span><span class="rung-city">' + c[0] + "<small>" + c[1] + '</small></span><span class="rung-prince"></span>';
    rungs.appendChild(li);
  });
  STEPS.forEach(function () { pips.appendChild(document.createElement("i")); });

  function render() {
    var s = STEPS[step];
    var items = rungs.querySelectorAll(".rung-prince");
    items.forEach(function (el, i) {
      var who = s.who[i];
      var before = last ? last.who[i] : who;
      el.textContent = who || "—";
      el.classList.toggle("is-empty", !who || /делят/.test(who));
      el.classList.remove("is-new");
      if (last && who !== before) { void el.offsetWidth; el.classList.add("is-new"); }
    });
    if (step === STEPS.length - 1) {
      rungs.querySelectorAll(".rung-city small").forEach(function (sm) { sm.textContent = "отчина"; });
    } else {
      rungs.querySelectorAll(".rung-city small").forEach(function (sm, i) { sm.textContent = CITIES[i][1]; });
    }
    yearEl.textContent = s.year;
    titleEl.textContent = s.title;
    descEl.textContent = s.text;
    outEl.innerHTML = s.out.length ? "Изгои: " + s.out.map(function (o) { return "<span>" + o + "</span>"; }).join("") : "";
    prev.disabled = step === 0;
    next.textContent = step === STEPS.length - 1 ? "Сначала ↺" : "Дальше →";
    pips.querySelectorAll("i").forEach(function (p, i) { p.classList.toggle("on", i <= step); });
    last = s;
  }
  prev.addEventListener("click", function () { if (step > 0) { step--; render(); } });
  next.addEventListener("click", function () { step = step === STEPS.length - 1 ? 0 : step + 1; if (step === 0) last = null; render(); });
  render();
})();
