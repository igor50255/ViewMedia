// Вызвать окно со справкой и изменением пути к папке с контентом
document.getElementById("open-settings").addEventListener("click", () => {
  const setings = document.getElementById("settings");
  setings.classList.remove("hide");
  
  console.log("settings");
  
});

// Изменить путь к папке с контентом
document.getElementById("chengePathContent").addEventListener("click", () => {

  const payload = { type: 'restarting-application' };
  chrome.webview.postMessage(payload);
});