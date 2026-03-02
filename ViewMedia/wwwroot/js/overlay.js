// функции открытия и закрытия прогресса на всё окно
function showLoader() {
    const el = document.getElementById('loader-overlay');
    el.classList.remove('hidden');
}

function hideLoader() {
    const el = document.getElementById('loader-overlay');
    el.classList.add('hidden');
}