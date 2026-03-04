document.addEventListener('DOMContentLoaded', () => {

  // Действия при клике на выбор папки первого уровня - (в окне справа)
  const collapsibleType = document.querySelector('#list-files');
  const collection = collapsibleType.querySelector('.collection');
  const headerTextType = collapsibleType.querySelector('#files-count');
  const menu = document.getElementById('mobile-menu');
  // действия при клине на выбор модели DAZ
  collection.addEventListener('click', (e) => {
    if (e.target.classList.contains('collection-item')) {
      const typeModel = e.target.textContent.trim(); // получаем имя кликнутотого типа модели DAZ
      console.log("Клик на выпадающем списке");

      // только меняем заголовок
      headerTextType.textContent = typeModel;
      // tooltip
      headerTextType.setAttribute("data-tooltip", typeModel);

      // закрываем collapsible
      const instance = M.Collapsible.getInstance(collapsibleType);
      instance.close(0);

      // отправка запроса для списка папкок в кликнутой папке
      const pathFolders = { type: 'get-path-second-folders', folder: typeModel };
      chrome.webview.postMessage(pathFolders);

      // очистка выбранного пункта меню-гамбургер
      document.querySelector('#nameActivSidenavMenu').textContent = "";

      // открыть меню-гамбургер
      const instance1 = M.Sidenav.getInstance(menu);
      instance1.open();
    }
  });

  // инициализация collapsible - меню выбора типа модели 
  const collapsibleType1 = document.querySelector('#list-files');
  M.Collapsible.init(collapsibleType1, {
    inDuration: 500,   // скорость открытия
    outDuration: 500,  // скорость закрытия
    accordion: false
  });

});