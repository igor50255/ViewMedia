// код, который относится к ручке раздвижения окна меню-гамбургер
let sidenavResizeState = {
  resizing: false,
  startX: 0,
  startWidth: 0,
  sidenav: null
};

let sidenavResizeGlobalEventsInited = false;

function initResizableSidenav(menu) {
  if (!menu) return;

  let handle = menu.querySelector('.resize-handle');

  if (!handle) {
    handle = document.createElement('div');
    handle.className = 'resize-handle';
    menu.appendChild(handle);
  }

  // if (!menu.dataset.sidenavInitialized) {
  //   M.Sidenav.init(menu, {
  //     edge: 'left',
  //     draggable: false
  //   });
  //   menu.dataset.sidenavInitialized = 'true';
  // }

  if (!handle.dataset.resizeBound) {
    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();

      sidenavResizeState.resizing = true;
      sidenavResizeState.startX = e.clientX;
      sidenavResizeState.startWidth = menu.offsetWidth;
      sidenavResizeState.sidenav = menu;
    });

    handle.dataset.resizeBound = 'true';
  }

  if (!sidenavResizeGlobalEventsInited) {
    document.addEventListener('mousemove', function (e) {
      if (!sidenavResizeState.resizing || !sidenavResizeState.sidenav) return;

      let width = sidenavResizeState.startWidth + (e.clientX - sidenavResizeState.startX);

      if (width < 200) width = 200;
      if (width > 600) width = 600;

      sidenavResizeState.sidenav.style.width = width + 'px';
    });

    document.addEventListener('mouseup', function () {
      sidenavResizeState.resizing = false;
      sidenavResizeState.sidenav = null;
    });

    sidenavResizeGlobalEventsInited = true;
  }
}

