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
function makeCard(src, name, url, id, videoName = "", animate = false) {
  const card = document.createElement("div");
  card.className = "gallery-card real";

  if (animate) {
    card.classList.add("card-fade-in");
  }

  // Сохраняем id в data-атрибуте
  card.dataset.id = id;
  card.dataset.url = url;
  card.dataset.name = name;
  card.dataset.src = src;
  card.dataset.videoName = videoName;

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

  // Индикатор для левой части (браузер) - показывать только если Url не пустой
  const indicatorLeft = document.createElement("div");
  indicatorLeft.className = "card-indicator card-indicator-left";
  if (!url || url.trim() === "") {
    indicatorLeft.classList.add("hidden");
  }

  // Индикатор для правой части (плеер) - показывать только если VideoName не пустой
  const indicatorRight = document.createElement("div");
  indicatorRight.className = "card-indicator card-indicator-right";
  if (!videoName || videoName.trim() === "") {
    indicatorRight.classList.add("hidden");
  }

  a.appendChild(indicatorLeft);
  a.appendChild(indicatorRight);

  const meta = document.createElement("div");
  meta.className = "gallery-meta";

  const title = document.createElement("div");
  title.className = "gallery-title";
  title.textContent = name;

  meta.style.cursor = "pointer";
  meta.appendChild(title);

  card.appendChild(a);
  card.appendChild(meta);

  // Контекстное меню по правому клику
  card.addEventListener("contextmenu", function (e) {
    e.preventDefault();

    currentContextCard = card;

    const menu = document.getElementById("preview-context-menu");
    menu.classList.add("active");

    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width || 0;
    const menuHeight = menuRect.height || 0;

    const padding = 32;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  });

  // Клик по картинке — левая/правая часть
  img.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      // Левая часть — открыть в браузере
      console.log("клик по картинке (левая часть): " + id);
      const openUrl = { type: 'open-url-brouser', openUrl: card.dataset.url };
      chrome.webview.postMessage(openUrl);
    } else {
      // Правая часть — запустить плеер
      console.log("клик по картинке (правая часть): " + id);
      const playVideo = { type: 'right-click-player', src, id };
      chrome.webview.postMessage(playVideo);
    }
  });

  // Клик по названию — третье действие
  title.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("клик по названию: " + id);
    // Здесь будет third-click действие
    const thirdClick = { type: 'third-click', id: id, name: name, src: card.dataset.src };
    chrome.webview.postMessage(thirdClick);
  });

  // Клик по нижнему блоку (meta) — также third-click действие (для совместимости)
  meta.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("клик по нижнему блоку: " + id);
    const thirdClick = { type: 'third-click', id: id, name: name, src: card.dataset.src };
    chrome.webview.postMessage(thirdClick);
  });

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
    const id = f.VideoId;
    const videoName = f.VideoName || "";
    grid.appendChild(makeCard(src, name, f.Url, id, videoName));
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
  const videoName = file.VideoName || "";
  grid.appendChild(makeCard(src, name, file.Url, file.VideoId, videoName, true));

  syncPlaceholders();

  // прокрутить скролл вниз
  const view = document.getElementById("view-window");
  smoothScrollTo(view, grid.scrollHeight, 1200);

  hideLoader(); // скрыть индикатор загрузки на всё окно
}

// Добавление карточки на второе место
// function addCardPlaice(file, pathFolderPreview) {
//   const grid = document.getElementById("grid");
//   if (!grid) return;

//   const name = file.PreviewName.substring(0, file.PreviewName.lastIndexOf('.')) || file.PreviewName; // получаем имя без расширения
//   const src = `${pathFolderPreview}/${encodeURIComponent(file.PreviewName)}`;
//   const card = makeCard(src, name);

//   const second = grid.querySelectorAll(".gallery-card.real")[1];

//   if (second) {
//     grid.insertBefore(card, second);
//   } else {
//     grid.appendChild(card);
//   }

//   syncPlaceholders();
// }

// Плавная прокрутка в самый низ
function smoothScrollTo(element, target, duration = 800) {
  const start = element.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // easing (медленно → быстро → медленно)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    element.scrollTop = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// Прокрутка к элементу
function scrollToElementCenter(container, element, duration = 800) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  const offset = elementRect.top - containerRect.top;

  const target =
    container.scrollTop +
    offset -
    container.clientHeight / 2 +
    element.clientHeight / 2;

  smoothScrollTo(container, target, duration);
}
