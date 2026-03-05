// 1) Вешаем глобальный клик для для закрития выпадающих списков при клике где угодно
document.addEventListener("pointerdown", (e) => {
  const onFilesBtn   = e.target.closest("#files-count");

  const inFilesList  = e.target.closest("#list-files");

  // 2) Клик внутри списков -> ничего не делаем
  if (inFilesList) return;

  // 3) Клик везде вне триггеров и списков -> закрыть оба
  closeCollapsible("#list-files");
}); // <-- важно: без capture


function closeCollapsible(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  let inst = M.Collapsible.getInstance(el);
  if (!inst) inst = M.Collapsible.init(el);

  // закрыть первую секцию (если у тебя одна)
  inst.close(0);

  // если секций может быть несколько — так надёжнее:
  // el.querySelectorAll("li").forEach((_, i) => inst.close(i));
}