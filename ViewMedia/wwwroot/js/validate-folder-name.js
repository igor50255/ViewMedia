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

