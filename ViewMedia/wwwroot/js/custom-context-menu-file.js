// Глобально храним выбранную карточку (используется при создании катрочки в gallery.js)
let currentContextCard = null;

// Закрытие меню по клику вне его
document.addEventListener("click", function (e) {
  const menu = document.getElementById("preview-context-menu");

  if (!menu.contains(e.target)) {
    menu.classList.remove("active");
  }
});

const contextPreviewMenu = document.getElementById("preview-context-menu");
// Обработка действий меню
contextPreviewMenu.addEventListener("click", function (e) {
  const action = e.target.dataset.action;
  if (!action || !currentContextCard) return;

  const id = currentContextCard.dataset.id;

  if (action === "open-folder") {
    currentContextCard.style.width = "200px";
    console.log("Открыть папку для элемента с id:", id);
    // тут ваша логика
  }

  if (action === "delete") {
    console.log("Удалить элемент с id:", id);

    // отправка запроса на удаление картинки-превью
    const deleteId = { type: 'send-delete-id', id,  pathConnectionFileJson: window.pathConnectionFileJson };
    chrome.webview.postMessage(deleteId);

  }

  // Закрытие меню
  contextPreviewMenu.classList.remove("active");
});

// Закрытие меню при скролле
document.getElementById("view-window").addEventListener('scroll', function () {
  contextPreviewMenu.classList.remove('active');
  currentContextCard = null;
});