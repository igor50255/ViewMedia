// Вызвать окно со справкой и изменением пути к папке с контентом
document.getElementById("open-settings").addEventListener("click", () => {
  const setings = document.getElementById("settings");
  const grid = document.getElementById("grid");

  if (setings.classList.contains('hide')) {
    setings.classList.remove('hide');
    grid.classList.add('hide');
  } else {
    setings.classList.add('hide');
    grid.classList.remove('hide');
  }

  console.log("settings");

});

// Изменить путь к папке с контентом
document.getElementById("chengePathContent").addEventListener("click", () => {

  const payload = { type: 'restarting-application' };
  chrome.webview.postMessage(payload);
});