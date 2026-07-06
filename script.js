document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-btn');
  const cards = document.querySelectorAll('.feature-card');
  const menuToggle = document.querySelector('.menu-toggle');
  const topnav = document.getElementById('topnav');

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      navButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;
      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.style.display = matches ? 'flex' : 'none';
        card.classList.remove('show');
        if (matches) {
          requestAnimationFrame(() => card.classList.add('show'));
        }
      });
    });
  });

  if (menuToggle && topnav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = topnav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      topnav.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });
});
