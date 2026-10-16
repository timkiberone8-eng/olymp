(() => {
  const KEY = "olymp";
  const MAX = 3;
  const params = new URLSearchParams(location.search);
  const group = params.get("g");
  const task = location.pathname.split("/").pop().replace(/\.html$/, "");

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }

  function read(g) {
    return load()[g] || {};
  }

  function reset(g) {
    const data = load();
    delete data[g];
    save(data);
  }

  let usedHint = false;

  function markHintUsed() {
    if (usedHint) return;
    usedHint = true;
    const el = document.createElement("div");
    el.className = "olymp-toast olymp-toast-hint";
    el.innerHTML = "<span>💡 Подсказка открыта</span> <span style='font-size:12px;opacity:0.85;'>(-1 ⭐ от награды)</span>";
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("hide"), 2800);
    setTimeout(() => el.remove(), 3500);
  }

  function starsText(n) {
    return "★".repeat(n) + "☆".repeat(MAX - n);
  }

  function toast(n, penalized = false) {
    const g = window.OLYMP_GROUPS && window.OLYMP_GROUPS[group];
    const plain = g && g.stars === false;
    if (plain && n < MAX && !penalized) return;
    const el = document.createElement("div");
    el.className = "olymp-toast";
    let msg = "";
    if (plain) {
      msg = "Задача решена!";
    } else if (penalized) {
      msg = "Решено с подсказкой (-1 ⭐)";
    } else if (n === MAX) {
      msg = "Задача решена! Все звёзды твои";
    } else {
      msg = "Звёзды сохранены, можно лучше";
    }
    el.innerHTML = plain ? msg : `<span class="olymp-stars">${starsText(n)}</span> <span>${msg}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("hide"), 3800);
    setTimeout(() => el.remove(), 4500);
  }

  function stars(n = MAX) {
    if (!group) return;
    let penalized = false;
    if (usedHint && n > 1) {
      n = Math.max(1, n - 1);
      penalized = true;
    }
    n = Math.max(0, Math.min(MAX, n));
    const data = load();
    const mine = data[group] || (data[group] = {});
    if ((mine[task] || 0) < n) {
      mine[task] = n;
      save(data);
    }
    toast(n, penalized);
  }

  function addChrome() {
    const style = document.createElement("style");
    style.textContent = `
      .olymp-nav a, .olymp-toast { font: 600 15px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; }
      .olymp-nav { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 2147483000;
        display: flex; justify-content: space-between; gap: 10px; pointer-events: none; }
      .olymp-nav.center { justify-content: center; }
      .olymp-nav a { pointer-events: auto; padding: 9px 14px; border-radius: 999px; background: #1f2937; color: #fff;
        text-decoration: none; box-shadow: 0 4px 14px rgba(0,0,0,.25); opacity: .9; }
      .olymp-nav a:hover { opacity: 1; }
      .olymp-toast { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483001;
        display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 16px;
        background: #fff7d6; color: #3b2f05; border: 2px solid #f2c94c; box-shadow: 0 8px 24px rgba(0,0,0,.2);
        transition: opacity .6s, transform .6s; }
      .olymp-toast.hide { opacity: 0; transform: translate(-50%, -12px); }
      .olymp-toast-hint { background: #eff6ff; color: #1e3a8a; border-color: #93c5fd; font-size: 14px; padding: 10px 18px; }
      .olymp-stars { color: #f2b705; font-size: 24px; letter-spacing: 2px; }
    `;
    document.head.appendChild(style);
    const nav = document.createElement("nav");
    nav.className = document.body.dataset.olympBack === "center" ? "olymp-nav center" : "olymp-nav";
    nav.innerHTML = `<a href="../${group}/">← Все задачи</a>`;
    document.body.appendChild(nav);

    const data = document.createElement("script");
    data.src = "../data/groups.js";
    data.onload = () => {
      const next = nextTask();
      if (!next) return;
      const link = document.createElement("a");
      link.href = `${next}.html?g=${group}`;
      link.title = window.OLYMP_TASKS[next].title;
      link.textContent = "Следующая задача →";
      nav.appendChild(link);
    };
    document.head.appendChild(data);
  }

  function nextTask() {
    const g = window.OLYMP_GROUPS && window.OLYMP_GROUPS[group];
    if (!g) return null;
    const lesson = g.lessons[g.lessons.length - 1];
    const list = lesson.tasks || [...lesson.today, ...lesson.review];
    const i = list.indexOf(task);
    return i >= 0 ? list[i + 1] || null : null;
  }

  // Global listeners for hints
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, a, summary, [data-hint]");
    if (!btn) return;
    const text = (btn.textContent || "").toLowerCase();
    const id = (btn.id || "").toLowerCase();
    const cls = (btn.className || "").toLowerCase();
    if (
      btn.hasAttribute("data-hint") ||
      id.includes("hint") ||
      cls.includes("hint") ||
      text.includes("подсказ")
    ) {
      markHintUsed();
    }
  }, true);

  document.addEventListener("toggle", (e) => {
    if (e.target.tagName === "DETAILS" && e.target.open) {
      const summary = e.target.querySelector("summary");
      const sumText = (summary ? summary.textContent : e.target.textContent || "").toLowerCase();
      if (sumText.includes("подсказ") || sumText.includes("hint")) {
        markHintUsed();
      }
    }
  }, true);

  if (group && /\/tasks\//.test(location.pathname)) {
    document.addEventListener("DOMContentLoaded", addChrome);
  }

  window.Olymp = {
    MAX,
    group,
    task,
    stars,
    read,
    reset,
    starsText,
    useHint: markHintUsed,
    usedHint: () => usedHint,
    best: () => (group ? read(group)[task] || 0 : 0)
  };
})();
