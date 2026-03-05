// пример: набор существующих имён (подставь свои данные)
// const existingFolderNames = new Set(["Docs", "Photos", "Work"]); 

function validateFolderName(name) {
  const trimmed = name.trim();

  if (!trimmed) return { ok: false, msg: "Введите имя папки." };
  if (trimmed.length < 2) return { ok: false, msg: "Минимум 2 символа." };
  if (trimmed.length > 64) return { ok: false, msg: "Максимум 64 символа." };

  // запрет символов (Windows-стиль)
  if (/[\\/:*?"<>|]/.test(trimmed)) return { ok: false, msg: 'Нельзя использовать символы: \\ / : * ? " < > |' };

  // запрет только пробелов/точек в конце — опционально
  if (/[. ]$/.test(trimmed)) return { ok: false, msg: "Имя не должно заканчиваться пробелом или точкой." };

  return { ok: true, msg: "Имя выглядит корректно." };
}

function isNameAvailable(name, existingFolderNames) {
  // сравнение без учёта регистра
  const lower = name.trim().toLowerCase();
  for (const n of existingFolderNames) {
    if (n.toLowerCase() === lower) return false;
  }
  return true;
}

function openCreateFolderModal(existingFolderNames) {
  return new Promise((resolve) => {
    const modalEl = document.getElementById("create-folder-modal");
    const modal = M.Modal.getInstance(modalEl) || M.Modal.init(modalEl);

    const input = document.getElementById("folder-name-input");
    const status = document.getElementById("folder-name-status");
    const okBtn = document.getElementById("create-folder-confirm");

    function setStatus({ ok, msg }, available) {
      // доступность учитываем только если базовая валидация ok
      const finalOk = ok && available;

      okBtn.disabled = !finalOk;

      input.classList.toggle("valid", finalOk);
      input.classList.toggle("invalid", !finalOk && input.value.trim().length > 0);

      if (!input.value.trim()) {
        status.className = "grey-text text-darken-1";
        status.textContent = "Введите имя папки…";
        return;
      }

      if (!ok) {
        status.className = "red-text text-darken-2";
        status.textContent = msg;
        return;
      }

      if (!available) {
        status.className = "red-text text-darken-2";
        status.textContent = "Такое имя уже занято.";
        return;
      }

      status.className = "green-text text-darken-2";
      status.textContent = "Имя доступно ✅";
    }

    function checkNow() {
      const name = input.value;
      const base = validateFolderName(name);
      const available = base.ok ? isNameAvailable(name, existingFolderNames) : false;
      setStatus(base, available);
    }

    function submit() {
      checkNow();
      if (okBtn.disabled) return;

      const name = input.value.trim();
      modal.close();
      resolve(name);
    }

    // reset
    input.value = "";
    input.classList.remove("valid", "invalid");
    okBtn.disabled = true;
    status.className = "grey-text text-darken-1";
    status.textContent = "Введите имя папки…";
    M.updateTextFields();

    modal.open();
    setTimeout(() => input.focus(), 50);

    input.oninput = checkNow;
    input.onkeydown = (e) => { if (e.key === "Enter") submit(); };

    okBtn.onclick = submit;
  });
}