async function renameSecondFolder(folderName) {
  // получаем наше модальное окно: RENAME
  const modalEl = document.getElementById("rename-folder-modal");
  // получаем все имена папкок в данной директории
  const names = Array.from(document.querySelectorAll("#mobile-menu a")).map(a => a.textContent.trim());
  console.log(names);
  // открываем модальное окно ввода нового имени с валидацией
  const nameCreateFolder = await openCreateFolderModal(names, modalEl, placeholder = "Старое имя (скопиравано в буфер обмена): " + folderName);

  console.log("Результат окна:", nameCreateFolder);
  if (nameCreateFolder === null) return; // пользователь отменил
  console.log("Валидное имя second-папки для переименовывания:", nameCreateFolder);

  // родительская директория
  const parentFolder = document.querySelector('#files-count').textContent;

  // отправка запроса для переменовывания папки 
  const pathFolders = { type: 'rename-second-folder', oldName: folderName, newName: nameCreateFolder, parentFolder: parentFolder };
  chrome.webview.postMessage(pathFolders);
}

// Переименовать папку второго уровня ( в окне программы )
function renameMenuItems(oldName, newName){
  const menu = document.getElementById("mobile-menu");
  if (!menu) return false;

  const items = menu.querySelectorAll("a.context-item");

  for (const item of items) {
    if (item.textContent === oldName) {
      item.textContent = newName;
      item.setAttribute("data-tooltip", newName);

      // проверяем активность
      const isActive = item.parentElement.classList.contains("active");
      if (isActive) {
        console.log("Переименована активная папка:", newName);
        document.getElementById("nameActivSidenavMenu").textContent = newName;
      }

      return true;
    }
  }

  return false;
}