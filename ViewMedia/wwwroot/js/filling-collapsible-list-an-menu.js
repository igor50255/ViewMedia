
function fiilingSelectionFolders(menuItems, folders) {

  // Заполнение меню-гамбургер (слева)
  const menu = document.getElementById("mobile-menu");

  menuItems.forEach(text => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = text;
    a.href = "#"; // если нужно — можно заменить на реальную ссылку

    li.appendChild(a);
    menu.appendChild(li);
  });


  // Заполнение выпадающего списка (справа)
  const collection1 = document.getElementById("files-collection");
  const counter = document.getElementById("files-count");

  // Обновляем заголовок (первый элемент)
  counter.textContent = folders[0];

  folders.forEach(file => {
    const item = document.createElement("div");
    item.className = "collection-item";
    item.textContent = file;
    collection1.appendChild(item);
  });
}