// Ctrl+W переключает fullscreen (вкл/выкл)
document.addEventListener('keydown', (e) => {
    // Ctrl + D
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.code === 'KeyD') {
        e.preventDefault(); // не даём браузеру выполнить своё действие

        // WPF fullscreen (без шапки/кнопок)
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({ type: "toggle-window-fullscreen" });
        } else {
            // fallback для браузера
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }

    // Выход из полноэкранного режима через Esc
    if (e.key === 'Escape') {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({ type: "exit-window-fullscreen" });
        }
    }
});

document.addEventListener('fullscreenchange', () => {
    setTimeout(() => {
        if (fitMode) {
            fitToScreen();
        } else {
            scaleToOne();
        }
    }, 100);
});
