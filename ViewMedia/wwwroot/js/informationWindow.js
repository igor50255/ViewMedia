
// инициализация окна: Информация
document.addEventListener('DOMContentLoaded', () => {
    const elem = document.getElementById('info-modal');

    M.Modal.init(elem, {
        dismissible: false, // ❗ нельзя закрыть кликом по фону / Esc
        opacity: 0.35,
        inDuration: 800,   // 1 сек появление
        outDuration: 800  // 1 сек исчезновение
    });
});

// Открыть окно
function showInfoModal(message, title = 'Информация') {
    const modalEl = document.getElementById('info-modal');
    const instance = M.Modal.getInstance(modalEl);

    document.getElementById('info-modal-title').textContent = title;
    document.getElementById('info-modal-text').textContent = message;

    instance.open();
}
// Закрыть окно
function hideInfoModal() {
    const modalEl = document.getElementById('info-modal');
    const instance = M.Modal.getInstance(modalEl);
    instance.close();
}