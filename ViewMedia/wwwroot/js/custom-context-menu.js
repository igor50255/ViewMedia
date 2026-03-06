const filesCollection = document.getElementById('files-collection');
const contextMenu = document.getElementById('file-context-menu');

let currentFileElement = null; // сюда сохраним элемент, по которому кликнули

// Открытие меню по правой кнопке
document.addEventListener('contextmenu', function (e) {
  const fileItem = e.target.closest('.context-item');

  // если клик был не по элементу списка — ничего не делаем
  if (!fileItem) return;

  e.preventDefault();

  currentFileElement = fileItem;

  let x = e.clientX;
  let y = e.clientY;

  // Сначала показываем меню, чтобы получить его размеры
  contextMenu.classList.add('active');

  const menuWidth = contextMenu.offsetWidth;
  const menuHeight = contextMenu.offsetHeight;

  // Чтобы меню не выходило за пределы окна
  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 10;
  }

  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 10;
  }

  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
});

// Клик по пункту меню
contextMenu.addEventListener('click', function (e) {
  const menuItem = e.target.closest('li[data-action]');
  if (!menuItem || !currentFileElement) return;

  const action = menuItem.dataset.action;
  const fileId = currentFileElement.dataset.id;
  const context = currentFileElement.dataset.context;
  const folderName = currentFileElement.textContent.trim();

  console.log('Действие:', action);
  console.log('context:', context);
  console.log('Имя файла:', folderName);

  if (context === 'parent-folder') {
    switch (action) {
      case 'rename':
        M.toast({ html: `Первое меню: Переименовать: ${folderName}` });
        break;
      case 'delete':
        M.toast({ html: `Первое меню: Удалить: ${folderName}` });
        break;
    }
  }
  if (context === 'mobile-menu') {
    switch (action) {
      case 'rename':
        M.toast({ html: `Второе меню: Переименовать: ${folderName}` });
        break;
      case 'delete':
        M.toast({ html: `Второе меню: Удалить: ${folderName}` });
        break;
    }
  }

    // Закрытие меню
    contextMenu.classList.remove('active');
  });

  // Закрытие меню по обычному клику
  document.addEventListener('click', function () {
    contextMenu.classList.remove('active');
  });

  // Закрытие меню при скролле
  window.addEventListener('scroll', function () {
    contextMenu.classList.remove('active');
  });