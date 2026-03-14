
// Просто окно информации
function showInfo(text, title = "Информация") {
    document.getElementById("info-modal-title").textContent = title;
    document.getElementById("info-modal-text").innerHTML = text;

    var elem = document.getElementById("info-modal");
    var instance = M.Modal.getInstance(elem);
    instance.open();
}
// Удаление папки
function confirmModal(text, nameButton = "Удалить") {
    return new Promise((resolve) => {

        const modalEl = document.getElementById("confirm-modal");
        const modal = M.Modal.getInstance(modalEl);

        const textEl = document.getElementById("confirm-modal-text");
        const okBtn = document.getElementById("confirm-modal-ok");
        const cancelBtn = document.getElementById("confirm-modal-cancel");

        textEl.innerHTML = text;
        okBtn.textContent = nameButton;

        const cleanup = () => {
            okBtn.onclick = null;
            cancelBtn.onclick = null;
        };

        okBtn.onclick = () => {
            cleanup();
            modal.close();
            resolve(true);
        };

        cancelBtn.onclick = () => {
            cleanup();
            modal.close();
            resolve(false);
        };

        modal.open();
    });
}
// Показать или заменить добавляемую карточку
function confirmModalThree(text) {
    return new Promise((resolve) => {

        const modalEl = document.getElementById("three-button-modal");
        const modal = M.Modal.getInstance(modalEl);

        const textEl = document.getElementById("three-button-modal-text");
        const cancelBtn = document.getElementById("three-button-cancel");
        const showBtn = document.getElementById("three-button-show");
        const okBtn = document.getElementById("three-button-ok");

        textEl.innerHTML = text;

        const cleanup = () => {
          cancelBtn.onclick = null;
          showBtn.onclick = null;
          okBtn.onclick = null;
        };

        cancelBtn.onclick = () => {
            cleanup();
            modal.close();
            resolve("cancel");
        };

        showBtn.onclick = () => {
            cleanup();
            modal.close();
            resolve("show");
        };

        okBtn.onclick = () => {
            cleanup();
            modal.close();
            resolve("ok");
        };

        modal.open();
    });
}
// Создание и Переименовывание папки
function openCreateFolderModal(existingFolderNames, modalEl, placeholder = false) {
  return new Promise((resolve) => {
    const modal = M.Modal.getInstance(modalEl) || M.Modal.init(modalEl, {
      dismissible: true
    });

    const input = modalEl.querySelector(".folder-name-input");
    // const label = modalEl.querySelector('label[for="folder-name-input"]');
    const oldName = modalEl.querySelector("#old-name-rename");
    const status = modalEl.querySelector(".folder-name-status");
    const okBtn = modalEl.querySelector(".create-folder-confirm");
    const cancelBtn = modalEl.querySelector(".modal-close");

    let finished = false;

    function done(result) {
      if (finished) return;
      finished = true;
      resolve(result);
    }

    modal.options.onCloseEnd = () => {
      done(null);
    };

    // label.textContent = placeholder;
    if(placeholder){
      oldName.textContent = placeholder;
    }

    function setStatus({ ok, msg }, available) {
      const finalOk = ok && available;

      okBtn.disabled = !finalOk;

      input.classList.toggle("valid", finalOk);
      input.classList.toggle("invalid", !finalOk && input.value.trim().length > 0);

      if (!input.value.trim()) {
        status.className = "folder-name-status grey-text text-darken-1";
        status.textContent = "Введите имя папки…";
        return;
      }

      if (!ok) {
        status.className = "folder-name-status red-text text-darken-2";
        status.textContent = msg;
        return;
      }

      if (!available) {
        status.className = "folder-name-status red-text text-darken-2";
        status.textContent = "Такое имя уже занято.";
        return;
      }

      status.className = "folder-name-status green-text text-darken-2";
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
      done(name);
    }

    function cancel() {
      modal.close();
      done(null);
    }

    // reset
    input.value = "";
    input.classList.remove("valid", "invalid");
    okBtn.disabled = true;
    status.className = "folder-name-status grey-text text-darken-1";
    status.textContent = "Введите имя папки…";
    M.updateTextFields();

    input.oninput = checkNow;
    input.onkeydown = (e) => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") cancel();
    };

    okBtn.onclick = submit;
    cancelBtn.onclick = cancel;

    modal.open();
    setTimeout(() => input.focus(), 50);
  });
}

// мы слушаем событие закрытия модального окна через onCloseEnd
function modalPromise(modalEl) {
  return new Promise((resolve) => {

    const modal = M.Modal.getInstance(modalEl) || M.Modal.init(modalEl);

    let finished = false;

    function done(result) {
      if (finished) return;
      finished = true;
      resolve(result);
    }

    modal.options.onCloseEnd = () => done(null);

    modal.open();

  });
}