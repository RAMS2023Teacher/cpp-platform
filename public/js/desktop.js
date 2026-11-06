/* Desktop chrome: taskbar clock and the main window's title. */
(function () {
  const clock = document.getElementById('clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick();
  setInterval(tick, 10000);

  const app = document.getElementById('app'), title = document.getElementById('wintitle');
  const setTitle = () => {
    const h1 = app.querySelector('.hero') ? null : app.querySelector('h1');
    title.textContent = h1 ? `${h1.textContent.trim()} - RoboCode Academy` : 'Welcome - RoboCode Academy';
  };
  new MutationObserver(setTitle).observe(app, { childList: true });
})();
