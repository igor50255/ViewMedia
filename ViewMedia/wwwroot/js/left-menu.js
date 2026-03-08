document.addEventListener('DOMContentLoaded', () => {

  const sidenavEl = document.querySelector('.sidenav');
  const sidenavInstance = M.Sidenav.init(sidenavEl, {
    inDuration: 800,
    outDuration: 800
  });

  // Действия при клике на любой пункт меню
  sidenavEl.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    if (link.dataset.action === "add-folder") {
      // получаем все элементы меню-гамбургер
      const names = Array.from(document.querySelectorAll("#mobile-menu a")).map(a => a.textContent.trim());
      console.log(names);
      // Вызываем диалоговое окно создания новой папки для вода имени папки и получаем имя новой папки
      const modalEl = document.getElementById("create-folder-modal");
      const nameCreateFolder = await openCreateFolderModal(names, modalEl);

      console.log("Результат окна:", nameCreateFolder);
      if (nameCreateFolder === null) return; // пользователь отменил

      console.log("Валидное имя папки:", nameCreateFolder);

      // родительская директория
      const parentFolder = document.querySelector('#files-count').textContent;

      // отправка запроса для создания папки 
      const pathFolders = { type: 'create-second-folder', nameFolder: nameCreateFolder, parentFolder: parentFolder };
      chrome.webview.postMessage(pathFolders);
    }
    else {
      // 1. Убираем active у всех пунктов
      sidenavEl.querySelectorAll('li').forEach(li => {
        li.classList.remove('active');
      });
      // 2. Делаем активным кликнутый пункт и изменяем имя активного элемента возле иконки меню
      clickOnMenu(link);
    }

    // 3. Закрываем меню
    sidenavInstance.close();
  });
});

function clickOnMenu(link) {
  const nameActivMenuSidenav = document.getElementById('nameActivSidenavMenu'); // активное эл в меню-гамбургер

  // 2. Добавляем active к выбранному пункту
  link.parentElement.classList.add('active');
  const nameActivMenu = link.textContent.trim();

  // 3. изменение указателя возле меню-гамбургер
  nameActivMenuSidenav.textContent = nameActivMenu;
  nameActivMenuSidenav.setAttribute("data-tooltip", nameActivMenu);
  nameActivMenuSidenav.setAttribute("data-position", "right");

  console.log('Клик по пункту меню:', nameActivMenu);
}


