
function fiilingSelectionFolders(menuItems, folders) {

  // Заполнение выпадающего списка (справа)
  const collection1 = document.getElementById("files-collection");
  const counter = document.getElementById("files-count");

  // Обновляем заголовок (первый элемент)
  counter.textContent = folders[0];
  // Добавляем tooltip
  counter.setAttribute("data-tooltip", folders[0]);
  counter.setAttribute("data-position", "left");

  folders.forEach(file => {
    const item = document.createElement("div");
    item.className = "collection-item";
    item.textContent = file;
    item.classList.add("tooltipped");
    item.setAttribute("data-tooltip", file);
    item.setAttribute("data-position", "left");
    collection1.appendChild(item);
  });

  // Заполнение меню-гамбургер (слева)
  fiilingMenuItems(menuItems);
}

function fiilingMenuItems(menuItems) {
  // Заполнение меню-гамбургер (слева)
  const menu = document.getElementById("mobile-menu");

  // Очистка старых элементов
    menu.replaceChildren();

  menuItems.forEach(text => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = text;
    a.href = "#"; // если нужно — можно заменить на реальную ссылку

    // Materialize tooltip
    a.classList.add("tooltipped");
    a.setAttribute("data-tooltip", text);
    a.setAttribute("data-position", "right");

    li.appendChild(a);
    menu.appendChild(li);
  });

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



