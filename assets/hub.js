(() => {
  const TASKS = window.OLYMP_TASKS;
  const GROUPS = window.OLYMP_GROUPS;
  const app = document.getElementById("app");

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function dayMonth(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  }

  function stars(n) {
    return `<div class="stars" aria-label="${n} из ${Olymp.MAX}">` +
      Array.from({ length: Olymp.MAX }, (_, i) => `<span class="${i < n ? "on" : ""}">★</span>`).join("") +
      "</div>";
  }

  const lessonTasks = (l) => l.tasks || [...l.today, ...l.review];

  function card(group, slug, got) {
    const t = TASKS[slug];
    const n = got[slug] || 0;
    const mark = GROUPS[group].stars === false ? (n === Olymp.MAX ? `<div class="done">✓ Решено</div>` : "") : stars(n);
    return `<a class="card${n === Olymp.MAX ? " full" : ""}" href="../tasks/${slug}.html?g=${group}">
      <div class="icon">${t.icon}</div>
      <div class="title">${esc(t.title)}</div>
      <div class="about">${esc(t.about)}</div>
      ${mark}
    </a>`;
  }

  function renderGroup(group) {
    const g = GROUPS[group];
    const got = Olymp.read(group);
    const lessons = g.lessons;
    const current = lessons[lessons.length - 1];
    const slugs = lessonTasks(current);
    const max = slugs.length * Olymp.MAX;
    const have = slugs.reduce((sum, s) => sum + (got[s] || 0), 0);
    const withStars = g.stars !== false;
    const solved = slugs.every((s) => (withStars ? got[s] : got[s] === Olymp.MAX));
    const grid = (list) => `<div class="grid">${list.map((s) => card(group, s, got)).join("")}</div>`;

    document.title = g.name ? `Олимпиада · ${g.name}` : "Олимпиада KIBERone";
    app.innerHTML = `
      <header class="top">
        <div>
          <div class="brand">Олимпиада KIBERone</div>
          <h1>${esc(g.name || "Задачи")}</h1>
          ${current.date ? `<div class="sub">Занятие ${dayMonth(current.date)}</div>` : ""}
        </div>
        ${withStars ? `<div class="score">
          Звёзды: <b>${have}</b> из ${max}
          <div class="bar"><i style="width:${(100 * have) / max}%"></i></div>
        </div>` : ""}
        <button class="qr-btn" type="button">Показать QR</button>
      </header>
      ${solved ? `<div class="win">${!withStars ? "🏆 Пройдены все!" : have === max ? "🌟 Идеально! Все задачи пройдены и все звёзды собраны" : "🏆 Пройдены все! Остались звёзды, которые можно добрать"}</div>` : ""}
      ${current.tasks ? grid(current.tasks) : ""}
      ${current.today && current.today.length ? `<h2>Сегодня решаем</h2>${grid(current.today)}` : ""}
      ${current.review && current.review.length ? `<h2>Разбираем домашнюю</h2>${grid(current.review)}` : ""}
      ${lessons.length > 1 ? `<details><summary>Прошлые занятия</summary>${lessons.slice(0, -1).reverse().map((l) => `
        <div class="past">${dayMonth(l.date)}</div>
        <div class="grid small">${lessonTasks(l).map((s) => card(group, s, got)).join("")}</div>`).join("")}</details>` : ""}
      <div class="foot"><button class="reset" type="button">Начать заново на этом компьютере</button></div>
      <div class="qr"><img src="qr.svg" alt="QR-код этой страницы"><p>${esc(location.host + location.pathname)}</p><p>Нажми, чтобы закрыть</p></div>
    `;

    const qr = app.querySelector(".qr");
    app.querySelector(".qr-btn").onclick = () => qr.classList.add("show");
    qr.onclick = () => qr.classList.remove("show");
    app.querySelector(".reset").onclick = () => {
      if (confirm(withStars ? "Стереть все звёзды этой группы на этом компьютере?" : "Стереть решённые задачи на этом компьютере?")) {
        Olymp.reset(group);
        renderGroup(group);
      }
    };
  }

  function renderIndex() {
    app.innerHTML = `
      <div class="brand">Олимпиада KIBERone</div>
      <h1>Выбери свою группу</h1>
      <div class="groups">${Object.entries(GROUPS).filter(([, g]) => g.name).map(([id, g]) => `
        <a class="card" href="${id}/"><div class="icon">🏆</div><div class="title">${esc(g.name)}</div></a>`).join("")}
      </div>`;
  }

  const group = document.body.dataset.group;
  const render = () => (group ? renderGroup(group) : renderIndex());
  render();
  window.addEventListener("pageshow", (e) => e.persisted && render());
})();
