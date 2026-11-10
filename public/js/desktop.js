/* Desktop chrome: taskbar clock and the main window's title. */
(function () {
  const clock = document.getElementById('clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick();
  setInterval(tick, 10000);

  // Look of the whole site, remembered in this browser. The button moves on to the next one.
  const THEMES = { eco: 'Eco', classic: 'Windows 95', future: 'Retro-Future' }, ORDER = Object.keys(THEMES);
  const themeBtn = document.getElementById('theme');
  const setTheme = name => {
    document.documentElement.dataset.theme = name;
    const next = ORDER[(ORDER.indexOf(name) + 1) % ORDER.length];
    themeBtn.textContent = THEMES[next];
    themeBtn.title = 'Switch the site to ' + THEMES[next];
    themeBtn.onclick = () => { setTheme(next); try { localStorage.setItem('look', next); } catch (e) {} };
  };
  let savedTheme = null; try { savedTheme = localStorage.getItem('look'); } catch (e) {}
  setTheme(ORDER.includes(savedTheme) ? savedTheme : 'eco');

  // Reading options, remembered in this browser.
  const panel = document.getElementById('reading-panel'), readBtn = document.getElementById('reading'), root = document.documentElement;
  const applyReading = o => { root.dataset.text = o.text || ''; root.dataset.spacing = o.spacing ? '1' : ''; root.dataset.font = o.font ? 'plain' : ''; };
  let reading = {}; try { reading = JSON.parse(localStorage.getItem('reading')) || {}; } catch (e) {}
  applyReading(reading);
  panel.elements.text.value = reading.text || ''; panel.elements.spacing.checked = !!reading.spacing; panel.elements.font.checked = !!reading.font;
  panel.onsubmit = e => e.preventDefault();
  panel.onchange = () => { reading = { text: panel.elements.text.value, spacing: panel.elements.spacing.checked, font: panel.elements.font.checked }; applyReading(reading); try { localStorage.setItem('reading', JSON.stringify(reading)); } catch (e) {} };
  readBtn.onclick = () => { panel.hidden = !panel.hidden; readBtn.setAttribute('aria-expanded', String(!panel.hidden)); };
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') { panel.hidden = true; readBtn.setAttribute('aria-expanded', 'false'); readBtn.focus(); } });

  const app = document.getElementById('app'), title = document.getElementById('wintitle');
  const setTitle = () => {
    const h1 = app.querySelector('.hero') ? null : app.querySelector('h1');
    title.textContent = h1 ? `${h1.textContent.trim()} - RoboCode Academy` : 'Welcome - RoboCode Academy';
    document.title = title.textContent;
  };
  new MutationObserver(setTitle).observe(app, { childList: true });
})();
