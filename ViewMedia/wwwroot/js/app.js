document.addEventListener('DOMContentLoaded', () => {
  // отправка запроса для получения актуального пути к папке с контентом для отображения в программе
  const pathFolder = { type: 'get-path-content' };
  chrome.webview.postMessage(pathFolder);

  // Получение актуального размера картинок в окне программы
  const sizeCard = { type: 'get-size-card' };
  chrome.webview.postMessage(sizeCard);

  // Получение актуального выбора браузера и режима инкогнито
  const browser = { type: 'get-actualy-browser' };
  chrome.webview.postMessage(browser);

  // отправка запроса для получения первоначальных данных для заполнения списков выбора папки
  const pathFolders = { type: 'get-path-folders' };
  chrome.webview.postMessage(pathFolders);


});

window.chrome.webview.addEventListener('message', (e) => {
  const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
  // отображение картинок-превью контента
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
    // записываем мапер пути к папке с контентом в глобальную переменную
    window.hostNameToFolderMapper = msg.hostNameToFolderMapper;
    // имя файла с данными об превью, видео и время создания контента
    window.nameConnectionFileJson = msg.nameConnectionFileJson;
    // имя папки с картинками-превью
    window.nameFolderPreview = msg.nameFolderPreview;
    // имя папки для видео
    window.nameFolderVideo = msg.nameFolderVideo;
  }
  // Получение актуального размера картинок в окне программы
  else if (msg.type == 'get-size-card-answer') {
    window.sizeCard = msg.sizeCard;
    var slider = document.getElementById('size-slider');
    slider.value = window.sizeCard;
    chengeSelectorSizeCard();// изменить селектор ширины в css
  }
  // Получение актуального выбора браузера и режима инкогнито
  else if (msg.type == 'get-actualy-browser-answer') {
    var brouser = msg.browserCode;
    // Выбрать браузер 
    document.querySelector(`input[name="browser"][value="${brouser}"]`).checked = true;
    // Установить чекбокс
    document.querySelector('#incognito').checked = msg.incognito;
  }
  // Не успешное удаление видео
  else if (msg.type == 'info-failed-video-delete') {
    showInfo(msg.maessage, "Ошибка при удалении видео");
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
      // сделать в фокусе +Добавить в меню-гамбургер
      document.querySelector("#mobile-menu li a")?.focus();
    }
  }
  // Создание новой папки в первом уровне
  else if (msg.type == 'create-first-folder-restart') {
    let nameCreateFolder = msg.nameFolder;
    let directories = msg.pathFolders;
    // заполнение меню и выпадающего списка данными
    if (directories) {
      fiilingSelectionFolders([], directories, nameCreateFolder);
      // очистить окно от старых карточек
      const grid = document.getElementById("grid");
      grid.innerHTML = "";
      // сделать в фокусе +Добавить в меню-гамбургер
      document.querySelector("#mobile-menu li a")?.focus();
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
    // обнуление списка url в этом окне
    window.listVideoId = [];
    // очистить окно от старых карточек
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    // новые данные для пути к файлу 
    const firstFolder = document.getElementById("files-count").textContent;
    const secondFolder = document.getElementById("nameActivSidenavMenu").textContent;
    const pathJson = `https://${window.hostNameToFolderMapper}/${firstFolder}/${secondFolder}/${window.nameConnectionFileJson}`;
    window.pathConnectionFileJson = pathJson;
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
    if (result) {
      console.log("Папка успешно удалена!");
      deleteSelectionFolder(nameDeleteFolder);
    }
    else {
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
  // Добавление карточки-превью в галерею
  else if (msg.type == 'get-content-result') {
    const dataConnection = msg.dataConnection;
    if (dataConnection != null) {
      console.log("Превью скачалось!");
      console.log(dataConnection.Url);
      console.log(dataConnection.PreviewName);
      console.log(dataConnection.CreatedAt);
      const firstFolder = document.getElementById("files-count").textContent;
      const secondFolder = document.getElementById("nameActivSidenavMenu").textContent;
      const pathFolderPreview = `https://${window.hostNameToFolderMapper}/${firstFolder}/${secondFolder}/${window.nameFolderPreview}`;

      // Добавление карточки
      addCard(dataConnection, pathFolderPreview);
      //addCardPlaice(dataConnection, pathFolderPreview);// добавление карточки на второе место

      // добавить VideoId в список загруженных видео ( в этом окне просмотра)
      window.listVideoId.push(dataConnection.VideoId);

      // заполняем заново: Количество элементов в текущем окне
      document.getElementById("numberPicturesCurrentWindow").textContent = window.listVideoId.length;
    }
    else {
      hideLoader(); // скрыть индикатор загрузки на всё окно
      showInfo(msg.validateResult);
      console.log("Превью не скачалось!");
    }
  }
  // удаление карточки из галереи
  else if (msg.type == 'send-result-delete-id') {
    if (msg.result) {
      console.log("Превью успешно удалено на сервере!");
      const card = document.querySelector(`.gallery-card[data-id="${msg.id}"]`);

      // удаление Id из списка
      const index = window.listVideoId.findIndex(item => item === msg.id);
      if (index !== -1) {
        window.listVideoId.splice(index, 1);
      }

      // удаляем карточку из DOM
      card.classList.add("fade");
      setTimeout(() => {
        card.remove();
      }, 500);

      // заполняем заново: Количество элементов в текущем окне
      document.getElementById("numberPicturesCurrentWindow").textContent = window.listVideoId.length;
    }
    else {
      console.log("Не удалось удалить превью на сервере!");
    }
  }
  // отключение оверлея загрузки
  else if (msg.type == 'finish-overlay') {
    hideLoader();
  }
  else return;

});

