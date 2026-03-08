document.addEventListener('DOMContentLoaded', () => {
  // отправка запроса для получения актуального пути к папке с контентом для отображения в программе
  const pathFolder = { type: 'get-path-content' };
  chrome.webview.postMessage(pathFolder);

  // отправка запроса для получения первоначальных данных для заполнения списков выбора папки
  const pathFolders = { type: 'get-path-folders' };
  chrome.webview.postMessage(pathFolders);


});

window.chrome.webview.addEventListener('message', (e) => {
  const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
  // отображение картинок превью контента
  if (msg.type == 'images') {
    let images = msg.data;
    console.log(images); // проверка контента
  }
  // Получение актуального пути к папке с контентом
  else if (msg.type == 'set-path-content') {
    let path = msg.pathContent;
    // прописывам актуальный путь 
    const content = document.querySelector('#path-content');
    content.textContent = path;
  }
  // Получение массива папок и заполнение списков выбора
  else if (msg.type == 'set-path-folders') {
    let directories = msg.pathFolders;
    // заполнение меню и выпадающего списка данными
    if (directories) {
      fiilingSelectionFolders(msg.pathItems, directories);
    }
    console.log("sdfasdf: " + directories);
  }
  // Получение массива папок в заданной директории
  else if (msg.type == 'set-path-second-folders') {
    let menuItems = msg.pathFolders;
    // заполнение меню и выпадающего списка данными
    if (menuItems) {
      // Заполнение меню-гамбургер (слева)
      fiilingMenuItems(menuItems);
    }
  }
  // Создание новой папки в первом уровне
  else if (msg.type == 'create-first-folder-restart') {
    let nameCreateFolder = msg.nameFolder;
    let directories = msg.pathFolders;
    // заполнение меню и выпадающего списка данными
    if (directories) {
      fiilingSelectionFolders([], directories, nameCreateFolder);
    }
  }
  // Создание новой папки во втором уровне
  else if (msg.type == 'create-second-folder-restart') {
    let nameCreateFolder = msg.nameFolder;
    let menuItems = msg.pathFolders;
    // заполнение меню и выпадающего списка данными
    if (menuItems) {
      fiilingMenuItems(menuItems, nameCreateFolder);
    }
  }
  // Переименовывании папки во втором уровне
  else if (msg.type == 'rename-second-folder-restart') {
    // заполнение меню новыми данными
    renameMenuItems(msg.oldName, msg.newName);
  }
  // Удаление папки во втором уровне
  else if (msg.type == 'delete-second-folder-restart') {
    // заполнение меню и выпадающего списка данными
    deleteMenuItems(msg.deleteName);
  }
  // Удаление папки в первом уровне
  else if (msg.type == 'delete-first-folder-restart') {
    let nameDeleteFolder = msg.deleteName;
    let result = msg.result;
    if (result){
      console.log("Папка успешно удалена!");
      deleteSelectionFolder(nameDeleteFolder);
    }
    else{
      console.log("Папка не пуста!");
      showInfo(`Папка <b>${nameDeleteFolder}</b> не пуста!`);
    }
   
  }
  // Переименование папки в первом уровне
  else if (msg.type == 'rename-first-folder-restart') {
    // заполнение меню и выпадающего списка данными
    renameNameFolderFirstLevel(msg.oldName, msg.newName);
    console.log("Папка успешно переименована!");
  }
  // отключение оверлея загрузки
  else if (msg.type == 'finish-overlay') {
    hideLoader();
  }
  else return;

});

