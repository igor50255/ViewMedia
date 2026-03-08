async function renameFirstFolder(folderName) {
  // получаем наше модальное окно: RENAME
  const modalEl = document.getElementById("rename-folder-modal");
  // Получаем имена всех папок из выпадающего списка
  const items = document.querySelectorAll("#files-collection .collection-item");
  const names = Array.from(items).map(el => el.textContent.trim());
  console.log(names);
  // открываем модальное окно ввода нового имени с валидацией
  const nameCreateFolder = await openCreateFolderModal(names, modalEl, placeholder = "Старое имя (скопиравано в буфер обмена): " + folderName);

  console.log("Результат окна:", nameCreateFolder);
  if (nameCreateFolder === null) return; // пользователь отменил
  console.log("Валидное имя first-папки для переименовывания:", nameCreateFolder);


  // отправка запроса для переменовывания папки 
  const pathFolders = { type: 'rename-first-folder', oldName: folderName, newName: nameCreateFolder };
  chrome.webview.postMessage(pathFolders);
}

// Переименование элемента по имени (в окне программы)
function renameNameFolderFirstLevel(oldName, newName){
  const items = document.querySelectorAll("#files-collection .context-item");
  const head = document.getElementById("files-count");

  for (const item of items) {
    if (item.textContent === oldName) {

      item.textContent = newName;

      // обновляем tooltip
      item.setAttribute("data-tooltip", newName);

      // Назначаем новое имя в шапке списка
      const isActive = item.classList.contains("active");
      if (isActive) {
        head.textContent = newName;
      }

      return true;
    }
  }

  return false;
}