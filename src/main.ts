import { App } from './App';
import { Boot, GraphicsQuality } from './boot';
import { LoadingScreen } from './screens/LoadingScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { CareerScreen } from './screens/CareerScreen';
import { Arena } from './arena';

let app: App | null = null;

function start(): void {
  try {
    app = new App({ canvasId: 'graphics-canvas' });
  } catch {
    // If PlayCanvas fails to initialize, still show the menu so the app is usable.
    app = null;
    const menu = document.getElementById('ui');
    if (menu) {
      menu.innerHTML = '';
      const err = document.createElement('div');
      err.className = 'screen menu-screen';
      err.innerHTML = '<div style="text-align:center;color:#ff6b6b;font-weight:800;">Engine initialization failed. Check WebGL support.</div>';
      menu.appendChild(err);
    }
    return;
  }
  // Placeholder cinematic arena background (Phase 2). Realistic arena comes in Phase 5.
  new Arena(app.app);

  // Register screens
  const loading = new LoadingScreen({
    onComplete: () => {
      showMenu();
    },
    durationMs: 1100,
  });
  const menu = new MainMenuScreen({
    onCareer: () => showCareer(),
    onFightNow: () => handleFightNow(),
    onBoxerProfile: () => handleBoxerProfile(),
    onSettings: () => handleSettings(),
  });
  const career = new CareerScreen({
    onBack: () => showMenu(),
    onContinue: () => handleContinue(),
  });

  app.registerScreen('loading', loading);
  app.registerScreen('menu', menu);
  app.registerScreen('career', career);

  // Enter via loading screen so the engine has a frame to initialize.
  app.show('loading');
}

function showMenu(): void {
  app?.show('menu');
}

function showCareer(): void {
  app?.show('career');
}

function handleFightNow(): void {
  // Fight Now requires a fighter profile. If none exists, route to creation.
  // When a profile exists, Continue opens the career dashboard (fight gameplay is Phase 6).
  import('./data/storage').then(({ loadFighter }) => {
    const fighter = loadFighter();
    if (fighter) {
      showCareer(); // dashboard with Continue
    } else {
      showCareer(); // creation form
    }
  });
}

function handleBoxerProfile(): void {
  import('./data/storage').then(({ loadFighter }) => {
    const fighter = loadFighter();
    if (fighter) {
      app?.show('career'); // will open dashboard; user taps View Profile
    } else {
      showCareer(); // creation form, then profile accessible after saving
    }
  });
}

function handleSettings(): void {
  if (!app) return;
  const next =
    app.quality === GraphicsQuality.High
      ? GraphicsQuality.Low
      : app.quality === GraphicsQuality.Medium
      ? GraphicsQuality.High
      : GraphicsQuality.Medium;
  app.setQuality(next);
  // Brief on-screen toast
  showToast(`Graphics: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
}

function handleContinue(): void {
  import('./data/storage').then(({ loadFighter }) => {
    const fighter = loadFighter();
    if (!fighter) {
      showToast('Create a fighter first.');
      return;
    }
    showToast(`Welcome back, ${fighter.firstName}.`);
    // Fight / career progression gameplay is Phase 6. Dashboard foundation is in place.
  });
}

let toastTimer: number = 0;
function showToast(msg: string): void {
  if (!app) return;
  clearTimeout(toastTimer);
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.bottom = '26px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.background = 'rgba(0,0,0,0.75)';
  el.style.color = '#ffd23a';
  el.style.padding = '8px 16px';
  el.style.borderRadius = '6px';
  el.style.fontSize = '0.9rem';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '200';
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.2s';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
  toastTimer = window.setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

// Graceful handling of page visibility already handled in Boot.
start();

export { App, Boot, GraphicsQuality };
