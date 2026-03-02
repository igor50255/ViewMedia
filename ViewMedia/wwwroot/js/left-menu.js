document.addEventListener('DOMContentLoaded', () => {
        const nameActivMenuSidenav = document.getElementById('nameActivSidenavMenu'); // активное эл в меню-гамбургер

        const sidenavEl = document.querySelector('.sidenav');
        const sidenavInstance = M.Sidenav.init(sidenavEl, {
          inDuration: 800,
          outDuration: 800
        });

        // Закрывать sidenav при клике на любой пункт
        sidenavEl.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (!link) return;

          // 1. Убираем active у всех пунктов
          sidenavEl.querySelectorAll('li').forEach(li => {
            li.classList.remove('active');
          });

          // 2. Добавляем active к выбранному пункту
          link.parentElement.classList.add('active');
          const nameActivMenu = link.textContent.trim();
          nameActivMenuSidenav.textContent = nameActivMenu; // именение указателя возле меню-гамбургер
          console.log('Клик по пункту меню:', nameActivMenu);

          // 3. Закрываем меню
          sidenavInstance.close();
        });
      });