
function fiilingSelectionFolders(menuItems, folders, nameCreateFolder = false) {

  // Заполнение выпадающего списка (справа)
  const collection1 = document.getElementById("files-collection");
  const counter = document.getElementById("files-count");

  // Очистка старых элементов
  collection1.replaceChildren();

  // Первым элементом идёт "+"
  const plus = document.createElement("div");
  plus.className = "collection-item center-align";
  plus.dataset.action = "add-folder";
  plus.textContent = "+ Добавить";
  collection1.appendChild(plus);

  // Обновляем заголовок (первый элемент)
  counter.textContent = folders[0];
  // Добавляем tooltip
  counter.setAttribute("data-tooltip", folders[0]);
  counter.setAttribute("data-position", "left");

  folders.forEach(file => {
    const item = document.createElement("div");
    item.classList.add("collection-item", "context-item");
    item.setAttribute("data-context", "parent-folder");
    item.textContent = file;
    item.classList.add("tooltipped");
    item.setAttribute("data-tooltip", file);
    item.setAttribute("data-position", "left");
    collection1.appendChild(item);
  });

  setActiveSelectionFolder(folders[0]);// делаем активным первый пункт в списке

  // Заполнение меню-гамбургер (слева)
  fiilingMenuItems(menuItems);

  // открыть меню-гамбургер
  if (nameCreateFolder) {
    // меняем заголовок
    const collapsibleType = document.querySelector('#list-files');
    const headerTextType = collapsibleType.querySelector('#files-count');
    headerTextType.textContent = nameCreateFolder;
    // делаем активным первый пункт в списке
    setActiveSelectionFolder(nameCreateFolder);
    // открываем меню-гамбургер
    const menu = document.getElementById('mobile-menu');
    const instance1 = M.Sidenav.getInstance(menu);
    instance1.open();
  }
}

function fiilingMenuItems(menuItems, nameCreateFolder = null) {
  // Заполнение меню-гамбургер (слева)
  const menu = document.getElementById("mobile-menu");

  // Очистка старых элементов
  menu.replaceChildren();

  // Первым элементом идёт "+"
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#"; // если нужно — можно заменить на реальную ссылку
  a.dataset.action = "add-folder";
  a.textContent = "+ Добавить";
  a.className = "center-align";
  li.appendChild(a);
  menu.appendChild(li);

  menuItems.forEach(text => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = text;
    a.setAttribute("data-context", "mobile-menu");
    //a.href = "#"; // если нужно — можно заменить на реальную ссылку

    // Materialize tooltip
    a.classList.add("tooltipped", "context-item");
    a.style.cursor = "default";
    a.setAttribute("data-tooltip", text);
    a.setAttribute("data-position", "right");

    li.appendChild(a);
    menu.appendChild(li);

    if(text == nameCreateFolder) clickOnMenu(a); // при добавлении новой папки выделяем новую папку
  });

  // Ручка для изменения ширины
  // const hand = document.createElement("div");
  // hand.className = "resize-handle";
  // menu.appendChild(hand);

  // Создание ручки для изменения ширины
  initResizableSidenav(menu);

  // инициализация tooltip
  const elems = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(elems, {
    exitDelay: 200,      // задержка перед скрытием (мс)
    enterDelay: 2000,     // задержка перед показом (мс)
    transitionMovement: 0, // «подпрыгивание» тултипа
    margin: 17,           // отступ от элемента
    position: 'bottom',     // top | right | bottom | left
  });
}




