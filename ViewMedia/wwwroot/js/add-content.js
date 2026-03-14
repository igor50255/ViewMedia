
// Добавить контент по кнопке + Добавить
document.getElementById("btn-plus").addEventListener("click", async function () {
  const firstFolder = document.getElementById("files-count").textContent;
  const secondFolder = document.getElementById("nameActivSidenavMenu").textContent;
  console.log(firstFolder);
  console.log(secondFolder);
  if (secondFolder == "") {
    console.log("Папка для просмотра не выбрана");
    return;
  }

  // получение url из буфера обмена
  let newUrl;
  try {
    newUrl = await navigator.clipboard.readText();
    console.log(newUrl);
  } catch (err) {
    console.error("Не удалось получить текст из буфера:", err);
    return;
  }
  // проверка на существование такого Url (используем список Id-видео из ютуба, который у нас уже есть)
  const Id = window.listVideoId.find(id => newUrl.includes(id));
  if (Id) {
    console.log("Такой адрес уже есть в окне просморта");
    // Получаем список всех карточек и по Id находим имя
    console.log("адрес: " + window.pathConnectionFileJson);
    const response = await fetch(window.pathConnectionFileJson);
    const list = await response.json();
    const elem = list.find(v => v.VideoId === Id);
    const videoName = elem ? elem.PreviewName : null;
    const view = document.getElementById("view-window");
    const card = document.querySelector(`.gallery-card[data-id="${Id}"]`);
    // модальное окно замены карточки, если такая существует
    const resultClick = await confirmModalThree(`Превью с таким адресом уже существует: <br><b>${videoName}</b><br> Заменить его?`, "Заменить");
    if (resultClick == "show") {
      // прокрутить к этой карточке   
      if (card) scrollToElementCenter(view, card, 800);
      return;
    }
    else if (resultClick == "ok") {
      // прокрутить к этой карточке
      if (card) scrollToElementCenter(view, card, 700);

      // запуск скачивания превью
      startDownloadPreview(firstFolder, secondFolder);
      
      // отправка запроса на удаление картинки-превью
      setTimeout(() => {
        const deleteId = { type: 'send-delete-id', id: Id, pathConnectionFileJson: window.pathConnectionFileJson };
        chrome.webview.postMessage(deleteId);
      }, 1000);

    }
    else return;
  }
  else {
    // запуск скачивания превью
    startDownloadPreview(firstFolder, secondFolder);
  }

});

// запуск скачивания превью
function startDownloadPreview(firstFolder, secondFolder) {
  const pathContent = { type: 'send-content-path', firstFolder, secondFolder };
  chrome.webview.postMessage(pathContent);

  showLoader(); // показать индикатор загрузки на всё окно
}

