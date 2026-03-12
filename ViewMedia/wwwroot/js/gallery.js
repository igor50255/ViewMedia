// 1) Перечисли файлы, которые лежат в папке ./images
const files = [
  // пример:
  // "1.jpg",
  // "2.png",
  // "photo.webp",
  // "1bfb40f840e04ee4b534bca1b4cfd23d.jpg",
  // "73b45b5636546b361e35012f483ed85f.jpg",
  // "41210c9a1bf58cb0d9f785030c0a74b7.jpg",
  // "597605.jpg",
  // "16121594.jpg",
  // "ana-de-armas-ana-de-armas-aktrisa-briunetka-krasivaia-vzglia.jpg",
  "c26c99c88466c090536aad0e3d16f004.jpg",
  "df.webp",
  "4nPGsERxTdA.jpg",
  "dff.webp",
  "Dk3LEGQxNNw.jpg"
];

// Максимальное количество карточек в первой строке
const MAX_FIRST_ROW = 9;

// Создаёт карточку изображения
function makeCard(src, name) {
  const card = document.createElement("div");
  card.className = "gallery-card real";

  const a = document.createElement("a");
  a.className = "gallery-thumb";
  a.href = src;
  a.target = "_blank";
  a.rel = "noreferrer";

  const img = document.createElement("img");
  img.loading = "lazy";      // ленивая загрузка
  img.src = src;
  img.alt = name;

  a.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "gallery-meta";

  const title = document.createElement("div");
  title.className = "gallery-title";
  title.textContent = name;

  const sub = document.createElement("div");
  sub.className = "gallery-sub";
  sub.textContent = "16:9 · cover";

  meta.appendChild(title);
  meta.appendChild(sub);

  card.appendChild(a);
  card.appendChild(meta);

  return card;
}

// Создаёт пустую карточку (плейсхолдер)
function makePlaceholder() {
  const card = document.createElement("div");
  card.className = "gallery-card placeholder";

  const thumb = document.createElement("div");
  thumb.className = "gallery-thumb";
  card.appendChild(thumb);

  const meta = document.createElement("div");
  meta.className = "gallery-meta";
  card.appendChild(meta);

  return card;
}

// Получает ширину карточки из CSS-переменной --card-w
function getCardWidthPx(grid) {
  const rootStyles = getComputedStyle(document.documentElement);
  const gridStyles = getComputedStyle(grid);

  const raw =
    gridStyles.getPropertyValue("--card-w").trim() ||
    rootStyles.getPropertyValue("--card-w").trim();

  const val = parseFloat(raw);
  return Number.isFinite(val) && val > 0 ? val : 240;
}

// Получает расстояние между карточками
function getGapPx(grid) {
  const s = getComputedStyle(grid);
  const raw = s.columnGap || s.gap || "16px";
  const val = parseFloat(raw);
  return Number.isFinite(val) && val >= 0 ? val : 16;
}

// Вычисляет сколько карточек помещается в строке
function calcColsThatFit(grid) {
  const W = grid.clientWidth;
  const cardW = getCardWidthPx(grid);
  const gap = getGapPx(grid);

  const cols = Math.max(1, Math.floor((W + gap) / (cardW + gap)));
  return Math.min(MAX_FIRST_ROW, cols);
}

// Пересчитывает и добавляет недостающие плейсхолдеры
function syncPlaceholders() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  // удаляем старые плейсхолдеры
  grid.querySelectorAll(".gallery-card.placeholder").forEach(el => el.remove());

  const realCount = grid.querySelectorAll(".gallery-card.real").length;

  // сколько карточек должно быть в строке
  const cols = calcColsThatFit(grid);
  const missing = Math.max(0, cols - realCount);

  // добавляем недостающие
  for (let i = 0; i < missing; i++) {
    grid.appendChild(makePlaceholder());
  }
}

// Инициализация галереи
// files — список файлов изображений
// data — список объектов описание карточки видео
function initGallery(data, pathFolderPreview) {
  const grid = document.getElementById("grid");
  if (!grid) {
    console.error('Не найден #grid. Добавь: <main id="grid" class="gallery-grid"></main>');
    return;
  }

  // очистить от старых карточек
  grid.innerHTML = "";

  // создаём карточки для всех файлов
  for (const f of data) {
    // const src = `./$images/${encodeURIComponent(f)}`;
    const name = f.PreviewName.substring(0, f.PreviewName.lastIndexOf('.')) || f.PreviewName; // получаем имя без расширения
    const src = `${pathFolderPreview}/${encodeURIComponent(f.PreviewName)}`;
    grid.appendChild(makeCard(src, name));
  }

  // первый расчёт плейсхолдеров
  syncPlaceholders();

  // обновление при изменении размера окна
  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(syncPlaceholders);
  });
}

// initGallery(files);

// Добавление карточки 
function addCard(file, pathFolderPreview) {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const name = file.PreviewName.substring(0, file.PreviewName.lastIndexOf('.')) || file.PreviewName; // получаем имя без расширения
  const src = `${pathFolderPreview}/${encodeURIComponent(file.PreviewName)}`;
  grid.appendChild(makeCard(src, name));

  syncPlaceholders();

  hideLoader(); // скрыть индикатор загрузки на всё окно
  
  // прокрутить скролл вниз
  const view = document.getElementById("view-window");
  view.scrollTo({
    top: grid.scrollHeight,
    behavior: "smooth"
  });
}

// Добавление карточки на второе место
function addCardPlaice(file, pathFolderPreview) {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const name = file.PreviewName.substring(0, file.PreviewName.lastIndexOf('.')) || file.PreviewName; // получаем имя без расширения
  const src = `${pathFolderPreview}/${encodeURIComponent(file.PreviewName)}`;
  const card = makeCard(src, name);

  const second = grid.querySelectorAll(".gallery-card.real")[1];

  if (second) {
    grid.insertBefore(card, second);
  } else {
    grid.appendChild(card);
  }

  syncPlaceholders();
}