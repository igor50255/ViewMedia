document.addEventListener("DOMContentLoaded", () => {
  // Инициализация модальных окон
  const modals = document.querySelectorAll(".modal");

  M.Modal.init(modals, {
    inDuration: 500,   // время открытия (мс)
    outDuration: 500,  // время закрытия (мс)
    opacity: 0.5,      // затемнение фона
    dismissible: true  // можно закрывать кликом вне окна
  });

});
