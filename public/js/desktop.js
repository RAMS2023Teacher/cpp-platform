/* Desktop chrome: taskbar clock and the main window's title. */
(function () {
  const clock = document.getElementById('clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick();
  setInterval(tick, 10000);

  // Look of the whole site: Windows 95 (default) or retro-futurism. Remembered in this browser.
  const THEMES = { classic: '🖥 Windows 95', future: '🚀 Retro-Future' };
  const themeBtn = document.getElementById('theme');
  const setTheme = name => {
    document.documentElement.dataset.theme = name;
    const other = name === 'future' ? 'classic' : 'future';
    themeBtn.textContent = THEMES[other];
    themeBtn.title = 'Switch the site to ' + THEMES[other];
    themeBtn.onclick = () => { setTheme(other); try { localStorage.setItem('theme', other); } catch (e) {} };
  };
  let savedTheme = null; try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
  setTheme(savedTheme === 'future' ? 'future' : 'classic');

  const app = document.getElementById('app'), title = document.getElementById('wintitle');
  const setTitle = () => {
    const h1 = app.querySelector('.hero') ? null : app.querySelector('h1');
    title.textContent = h1 ? `${h1.textContent.trim()} - RoboCode Academy` : 'Welcome - RoboCode Academy';
  };
  new MutationObserver(setTitle).observe(app, { childList: true });
})();
