window.OLYMP_TASKS = {
  "magic-squares": { title: "Магические квадраты", icon: "🔢", about: "Впиши числа так, чтобы суммы во всех строках, столбцах и диагоналях совпали. Три квадрата" },
  "carpet": { title: "Коврик со звёздочкой", icon: "🧶", about: "Раздели коврик на 4 одинаковые части, в каждой ровно одна звёздочка" },
  "coins": { title: "Монетки", icon: "💰", about: "Собери 4 стопки по 2 монеты за 4 хода. Монета прыгает ровно через 2 монеты" },
  "princess": { title: "Задача для принцесс", icon: "👑", about: "Найди верный путь в зимний сад через 3 двери по советам принцессы и служанки" },
  "grasshopper": { title: "Кузнечик", icon: "🦗", about: "Составь программу, чтобы кузнечик побывал над числами 1, 2, 3, 4, 5 и закончил на 5" },
  "guards": { title: "Стражники", icon: "🛡️", about: "Расставь не больше 21 стражника так, чтобы все 14 улиц стали безопасными" },
  "wolves-foxes": { title: "Волки и лисы", icon: "🐺", about: "Переправь всех на другой берег. Три звезды, если уложишься в 9 ходов" },
  "boxes": { title: "Ящики", icon: "📦", about: "Разложи ящики по стопкам, по одному виду в стопке, двумя погрузчиками за 6 минут" },
  "new-arithmetic": { title: "Новая арифметика", icon: "📐", about: "Найди сумму третьего столбца по таблице фигур Софы 3×3" },
  "nested-loop": { title: "Вложенный цикл", icon: "🔄", about: "Вычисли значение переменной S после выполнения вложенного цикла" },
};

// Новое занятие дописывается в конец lessons: сайт показывает последнее, остальные уходят в «Прошлые занятия».
// Группа без name и занятие с tasks вместо today/review дают страницу без группы, даты и разделов; в списке групп её нет. stars: false убирает звёзды, остаётся «Решено».
window.OLYMP_GROUPS = {
  "sb-0940": {
    name: "Суббота 09:40",
    lessons: [
      { date: "2026-10-10", today: ["magic-squares", "carpet"], review: ["grasshopper", "wolves-foxes"] },
      { date: "2026-10-17", today: ["new-arithmetic"], review: ["princess"] },
    ],
  },
  "sb-1220": {
    name: "Суббота 12:20",
    lessons: [
      { date: "2026-10-10", today: ["magic-squares", "carpet", "coins"], review: ["grasshopper", "guards", "wolves-foxes"] },
      { date: "2026-10-17", today: ["new-arithmetic", "nested-loop", "boxes"], review: ["princess", "magic-squares", "coins"] },
    ],
  },
  "zadachi": {
    stars: false,
    lessons: [
      { tasks: ["princess", "new-arithmetic", "nested-loop", "boxes", "magic-squares", "carpet", "coins"] },
    ],
  },
};
