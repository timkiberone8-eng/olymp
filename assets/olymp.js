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

  function starsText(n) {
    return "★".repeat(n) + "☆".repeat(MAX - n);
  }

  function toast(n) {
    const el = document.createElement("div");
    el.className = "olymp-toast";
    el.innerHTML = `<span class="olymp-stars">${starsText(n)}</span>` +
      (n === MAX ? "Задача решена! Все звёзды твои" : "Звёзды сохранены, можно лучше");
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("hide"), 3500);
    setTimeout(() => el.remove(), 4200);
  }

  function stars(n = MAX) {
    if (!group) return;
    n = Math.max(0, Math.min(MAX, n));
    const data = load();
    const mine = data[group] || (data[group] = {});
    if ((mine[task] || 0) >= n) return;
    mine[task] = n;
    save(data);
    toast(n);
  }

  function addChrome() {
    const style = document.createElement("style");
    style.textContent = `
      .olymp-back, .olymp-toast { font: 600 15px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; }
      .olymp-back { position: fixed; left: 12px; bottom: 12px; z-index: 2147483000; padding: 9px 14px;
        border-radius: 999px; background: #1f2937; color: #fff; text-decoration: none;
        box-shadow: 0 4px 14px rgba(0,0,0,.25); opacity: .9; }
      .olymp-back:hover { opacity: 1; }
      .olymp-back.center { left: 50%; transform: translateX(-50%); }
      .olymp-toast { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483001;
        display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 16px;
        background: #fff7d6; color: #3b2f05; border: 2px solid #f2c94c; box-shadow: 0 8px 24px rgba(0,0,0,.2);
        transition: opacity .6s, transform .6s; }
      .olymp-toast.hide { opacity: 0; transform: translate(-50%, -12px); }
      .olymp-stars { color: #f2b705; font-size: 24px; letter-spacing: 2px; }
    `;
    document.head.appendChild(style);
    const back = document.createElement("a");
    back.className = document.body.dataset.olympBack === "center" ? "olymp-back center" : "olymp-back";
    back.href = `../${group}/`;
    back.textContent = "← Все задачи";
    document.body.appendChild(back);
  }

  if (group && /\/tasks\//.test(location.pathname)) {
    document.addEventListener("DOMContentLoaded", addChrome);
  }

  window.Olymp = { MAX, group, task, stars, read, reset, starsText, best: () => (group ? read(group)[task] || 0 : 0) };
})();
