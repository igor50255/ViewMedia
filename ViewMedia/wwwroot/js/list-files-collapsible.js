// Действия при клике на выбор папки первого уровня - (в окне справа)
const collapsibleType = document.querySelector('#list-files');
const collection = collapsibleType.querySelector('.collection');
// действия при клине на выбор модели DAZ
collection.addEventListener('click', (e) => {
  if (e.target.classList.contains('collection-item')) {
    const typeModel = e.target.textContent.trim(); // получаем имя кликнутотого типа модели DAZ
    console.log("ddddddddddddddddddddd");
    // // возвращаем фильтрацию в исходное положение
    // document.querySelector('#files-countSearch').textContent = "All";

    // // вывод в окно активного таба
    // printToActivTab(typeModel, null)
  }
});

 // инициализация collapsible - меню выбора типа модели 
  const collapsibleType1 = document.querySelector('#list-files');
  M.Collapsible.init(collapsibleType1, {
    inDuration: 500,   // скорость открытия
    outDuration: 500,  // скорость закрытия
    accordion: false
  });

  // меняем заголовок у выбора поколения модели и закрываем collapsible при клике
  const headerTextType = collapsibleType.querySelector('#files-count');
  collapsibleType.querySelectorAll('.collection-item').forEach(item => {
    item.addEventListener('click', () => {
      // только меняем заголовок
      headerTextType.textContent = item.textContent.trim();

      // закрываем collapsible
      const instance = M.Collapsible.getInstance(collapsibleType);
      instance.close(0);
    });
  });
