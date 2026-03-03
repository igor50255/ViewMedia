document.addEventListener('DOMContentLoaded', () => {
  // отправка запроса для получения актуального пути к папке с контентом для отображения в программе
  const payload = { type: 'get-path-content' };
  chrome.webview.postMessage(payload);

  const menuItems = [
    "Главная",
    "Услуги",
    "Контакты",
    "Contacts"
  ];
  const folders = [
    "Genesis 9",
    "Genesis 8 - 8.1",
    "Genesis 3",
    "Genesis 2",
    "Victoria 4",
    "Other"
  ];
  // заполнение меню и выпадающего списка данными
  fiilingSelectionFolders(menuItems, folders);

  window.chrome.webview.addEventListener('message', (e) => {
    const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    // отображение картинок превью контента
    if (msg.type == 'images') {
      let images = msg.data;
      console.log(images); // проверка контента
    }
    // получение актуального пути к папке с контентом
    else if (msg.type == 'set-path-content') {
      let path = msg.pathContent;
      // прописывам актуальный путь 
      const content = document.querySelector('#path-content');
      content.textContent = path;
    }
    // отключение оверлея загрузки
    else if (msg.type == 'finish-overlay') {
      hideLoader();
    }
    else return;


  });
});