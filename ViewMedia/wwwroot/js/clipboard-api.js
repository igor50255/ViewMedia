function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log("Скопировано в буфер:", text);
    })
    .catch(err => {
      console.error("Ошибка копирования:", err);
    });
}