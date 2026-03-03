document.addEventListener('DOMContentLoaded', () => {
  const menuItems = [
    "Главная",
    "Услуги",
    "Контакты",
    "Contacts"
  ];
  const folders = [
    "Genesis 9",
    "Genesis 8 - 8.1",
    "Genesis 3",
    "Genesis 2",
    "Victoria 4",
    "Other"
  ];
  // заполнение меню и выпадающего списка данными
  fiilingSelectionFolders(menuItems, folders);
});