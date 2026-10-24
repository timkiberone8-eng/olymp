(() => {
try { const saved=localStorage.getItem('olymp-theme'); if(saved==='light'||saved==='dark')document.documentElement.dataset.theme=saved; } catch {}
if(location.pathname.includes('/tasks/'))document.documentElement.classList.add('olymp-task');
document.addEventListener('DOMContentLoaded',()=>{
document.body.insertAdjacentHTML('afterbegin','<button type="button" class="theme" aria-label="Сменить тему"><svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1Z"/></svg></button>');
const root = document.documentElement;
  const themeButton = document.querySelector(".theme");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const touchOnly = matchMedia("(hover: none)");
  const quiet = matchMedia("(prefers-reduced-motion: reduce)");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const showTheme = () => themeButton.classList.toggle("dark", currentTheme() === "dark");
  showTheme();
  systemDark.addEventListener("change", showTheme);
  let sleep;
  const wake = () => {
    themeButton.classList.add("awake");
    clearTimeout(sleep);
    sleep = setTimeout(() => themeButton.classList.remove("awake"), 3000);
  };
  themeButton.addEventListener("click", () => {
    if (touchOnly.matches && !themeButton.classList.contains("awake")) {
      wake();
      return;
    }
    const next = currentTheme() === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      showTheme();
      try { localStorage.setItem("olymp-theme", next); } catch {}
    };
    if (touchOnly.matches) wake();
    if (!document.startViewTransition || quiet.matches) {
      apply();
      return;
    }
    const box = themeButton.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.4, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });

});
})();
