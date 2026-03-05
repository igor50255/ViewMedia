document.addEventListener('DOMContentLoaded', () => {

  // Действия при клике на выбор папки первого уровня - (в окне справа)
  const collapsibleType = document.querySelector('#list-files');
  const collection = collapsibleType.querySelector('.collection');
  const headerTextType = collapsibleType.querySelector('#files-count');
  const menu = document.getElementById('mobile-menu');
  // действия при клине на выбор модели DAZ
  collection.addEventListener('click', async (e) => {
    if (e.target.classList.contains('collection-item')) {
      const typeModel = e.target.textContent.trim(); // получаем имя кликнутотого типа модели DAZ
      console.log("Клик на выпадающем списке");
      if (!typeModel) return;

      // Добавление новой папки
      if (e.target.dataset.action === "add-folder") {
        // Получаем имена всех папок из выпадающего списка
        const items = document.querySelectorAll("#files-collection .collection-item");
        const names = Array.from(items).map(el => el.textContent.trim());
        console.log(names);
        // Вызываем диалоговое окно для вода имени папки и получаем имя новой папки
        const nameCreateFolder = await openCreateFolderModal(names);
        console.log("Создаём папку:", nameCreateFolder);

        // отправка запроса для создания папки
        const pathFolders = { type: 'create-first-folder', nameFolder: nameCreateFolder };
        chrome.webview.postMessage(pathFolders);
      }
      else {
        // меняем заголовок
        headerTextType.textContent = typeModel;

        // tooltip заголовка
        headerTextType.setAttribute("data-tooltip", typeModel);

        // отправка запроса для получения списка папкок в кликнутой папке
        const pathFolders = { type: 'get-path-second-folders', folder: typeModel };
        chrome.webview.postMessage(pathFolders);

        // очистка выбранного пункта меню-гамбургер
        document.querySelector('#nameActivSidenavMenu').textContent = "";

        // открыть меню-гамбургер
        const instance1 = M.Sidenav.getInstance(menu);
        instance1.open();

      }
    }

    // закрываем collapsible
    const instance = M.Collapsible.getInstance(collapsibleType);
    instance.close(0);
  });

  // инициализация collapsible - меню выбора типа модели 
  const collapsibleType1 = document.querySelector('#list-files');
  M.Collapsible.init(collapsibleType1, {
    inDuration: 500,   // скорость открытия
    outDuration: 500,  // скорость закрытия
    accordion: false
  });

});