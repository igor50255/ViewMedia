async function deleteFirstFolder(folderName) {
  const ok = await confirmModal(`Вы действительно хотите удалить папку: <strong class="red-text">${folderName}</strong>? Внимание: удалить можно только пустую папку! Удалите всё содержимое, если оно есть.`);
  if (!ok) return;
  console.log(`Раздел: ${folderName} удаляется...`);

  // отправка запроса для удаление папки 
  const pathFolders = { type: 'delete-first-folder', deleteName: folderName };
  chrome.webview.postMessage(pathFolders);
}

// Удаление элемента по имени (в окне программы)
function deleteSelectionFolder(name) {
  const items = document.querySelectorAll("#files-collection .context-item");
  const head = document.getElementById("files-count");

  for (const item of items) {
    if (item.textContent === name) {

      const isActive = item.classList.contains("active");

      item.remove();

      if (isActive) {
        // head.textContent = items[0].textContent;
        // items[0].classList.add("active");
        // отправка запроса для получения первоначальных данных для заполнения списков выбора папки
        // как при запуске программы
        const pathFolders = { type: 'get-path-folders' };
        chrome.webview.postMessage(pathFolders);
      }

      return true;
    }
  }

  return false;
}