// Вызвать окно со справкой и изменением пути к папке с контентом
document.getElementById("open-settings").addEventListener("click", () => {
  const setings = document.getElementById("settings");
  const grid = document.getElementById("grid");

  if (setings.classList.contains('hide')) {
    setings.classList.remove('hide');
    grid.classList.add('hide');
  } else {
    setings.classList.add('hide');
    grid.classList.remove('hide');
  }

  console.log("settings");
  // сделать показ подсказки без задержки (почти)
  // на иконке
  M.Tooltip.init(document.querySelectorAll('.open-root'), { enterDelay: 400 });
  // на пути к папке показать полный путь
  const tooltip = document.querySelector('#path-content');
  tooltip.dataset.tooltip = document.querySelector('#path-content').textContent;
  M.Tooltip.init(tooltip, { enterDelay: 400 });
});

// Изменить путь к папке с контентом
document.getElementById("chengePathContent").addEventListener("click", () => {

  const payload = { type: 'restarting-application' };
  chrome.webview.postMessage(payload);
});

// Клик по слайдеру изменения ширины картинки
var slider = document.getElementById('size-slider');
slider.addEventListener('input', () => {
  window.sizeCard = slider.value;
  chengeSelectorSizeCard();
  console.log(window.sizeCard);
  // сохранить изменения для следующего запуска
  // отправка запроса для получения первоначальных данных для заполнения списков выбора папки
  const saveSizeCard = { type: 'save-size-card', sizeCard: window.sizeCard };
  chrome.webview.postMessage(saveSizeCard);
});

const sizes = { 1: '250px', 2: '280px', 3: '310px', 4: '340px', 5: '370px' };
// изменить селектор ширины карточки-превью в css
function chengeSelectorSizeCard() {
  const size = sizes[window.sizeCard];
  document.documentElement.style.setProperty('--card-w', size);
}

// клик по иконке: Открыть базовую папку
function open_folder() {
  const openDir = { type: 'open-root-dir' };
  chrome.webview.postMessage(openDir);
}

// Сохранить выбранный браузер и режим инкогнито
// Радиокнопка
document.querySelectorAll('input[name="browser"]').forEach(el => {
  el.addEventListener('change', (e) => {
    console.log(e.target.value); // значение выбранной кнопки
    saveChangeBrowser(Number(e.target.value), true, 1)
  });
});

// Чекбокс
document.querySelector('#incognito').addEventListener('change', (e) => {
  console.log(e.target.checked); // true / false
  saveChangeBrowser(0, e.target.checked, 2)
});
// отправка на сохранение (если check = 1, то это изменения выбора браузера, если 2, то режима инкогнито)
function saveChangeBrowser(browser, incognito, check){
  const saveChangeBrowser = { type: 'save-change-browser', browser, incognito, check};
  chrome.webview.postMessage(saveChangeBrowser);
}
  

