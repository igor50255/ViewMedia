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
    console.log("Открыть папку для элемента с id:", id);
    // отправка запроса для открытия папки этой карточки 
    const pathFolder = { type: 'open-card-folder', pachFolder: currentContextCard.dataset.src };
    chrome.webview.postMessage(pathFolder);
  }

  if (action === "delete") {
    console.log("Удалить элемент с id:", id);

    // отправка запроса на удаление картинки-превью
    const deleteId = { type: 'send-delete-id', id, pathConnectionFileJson: window.pathConnectionFileJson };
    chrome.webview.postMessage(deleteId);
  }

  if (action === "copy-url") {
    copyToClipboard(currentContextCard.dataset.url);
  }

  if (action === "copy-name") {
    copyToClipboard(currentContextCard.dataset.name);
  }

  if (action === "upload-video") {
    console.log("Загрузить видео!");
    const pathFolderVideo = { type: 'send-path-folder-video', src:  currentContextCard.dataset.src, id: currentContextCard.dataset.id};
    chrome.webview.postMessage(pathFolderVideo);
  }

  if (action === "delete-video") {
    console.log("Удалить видео!");
    const pathFolderVideo = { type: 'send-path-folder-video-delete', src:  currentContextCard.dataset.src, id: currentContextCard.dataset.id};
    chrome.webview.postMessage(pathFolderVideo);
  }

  if (action === "delete-url") {
    console.log("Удалить ссылку!");
    const deleteUrlData = { type: 'delete-url', id: currentContextCard.dataset.id, pathConnectionFileJson: window.pathConnectionFileJson};
    chrome.webview.postMessage(deleteUrlData);
  }

  if (action === "save-video") {
    console.log("Сохранить видео!");
    const saveVideoData = { type: 'save-video', src: currentContextCard.dataset.src, id: currentContextCard.dataset.id};
    chrome.webview.postMessage(saveVideoData);
  }

  // Закрытие меню
  contextPreviewMenu.classList.remove("active");
});

// Закрытие меню при скролле
document.getElementById("view-window").addEventListener('scroll', function () {
  contextPreviewMenu.classList.remove('active');
  currentContextCard = null;
});