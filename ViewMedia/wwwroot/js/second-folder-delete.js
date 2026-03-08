
async function deleteSecondFolder(folderName) {
  const ok = await confirmModal(`Вы действительно хотите удалить раздел: <strong class="red-text">${folderName}</strong> со всем его содержимым?`);
  if (!ok) return;
  console.log(`Раздел: ${folderName} удаляется...`);

  // Получение родительской папки (папка первого уровня)
  const headerTextType = document.querySelector('#files-count').textContent;
  // отправка запроса для удаление папки 
  const pathFolders = { type: 'delete-second-folder', deleteName: folderName, parentFolder: headerTextType };
  chrome.webview.postMessage(pathFolders);
}

// Удалить папку второго уровня ( в окне программы )
function deleteMenuItems(deleteName) {
  const menu = document.getElementById("mobile-menu");
  if (!menu) return false;

  const items = menu.querySelectorAll("a.context-item");

  for (const item of items) {
    if (item.textContent === deleteName) {

      // проверяем активность
      const isActive = item.parentElement.classList.contains("active");

      if (isActive) {
        console.log("Удалена активная папка:", deleteName);
        document.getElementById("nameActivSidenavMenu").textContent = "";
      }

      // удаляем li
      item.parentElement.remove();

      return true;
    }
  }

  return false;
}