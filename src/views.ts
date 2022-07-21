import {
  addPixiContainersForView,
  resizePixi,
  app,
  updateCameraPosition,
} from './graphics/PixiUtils';
import {
  clickHandler,
  contextmenuHandler,
  endTurnBtnListener,
  keydownListener,
  keyupListener,
  mouseDownHandler,
  mouseUpHandler,
  mouseMove,
  onWindowBlur,
  keypressListener,
} from './graphics/ui/eventListeners';

// A view is not shared between players in the same game, a player could choose any view at any time
export enum View {
  Menu,
  Setup,
  Game,
  Disconnected
}
const elUpgradePicker = document.getElementById('upgrade-picker') as HTMLElement;
let lastNonMenuView: View | undefined;
function closeMenu() {
  // Change to the last non menu view
  if (lastNonMenuView) {
    setView(lastNonMenuView);
    // When the menu closes, set the menu back
    // to the main menu route
    if (globalThis.setMenu) {
      globalThis.setMenu('PLAY');
    }
  } else {
    console.log('Cannot close menu yet, no previous view to change to.');
  }

}
if (!globalThis.headless) {
  const menuBtnId = 'menuBtn';
  const elMenuBtn: HTMLButtonElement = document.getElementById(
    menuBtnId,
  ) as HTMLButtonElement;
  elMenuBtn.addEventListener('click', toggleMenu);
}
// Make 'closeMenu' available to the svelte menu
globalThis.closeMenu = closeMenu;
export function toggleMenu() {
  const elMenu = document.getElementById('menu') as HTMLElement;
  const menuClosed = elMenu.classList.contains('hidden');
  if (menuClosed) {
    // Open it
    setView(View.Menu);
  } else {
    closeMenu();
  }

}
// The "View" is what the client is looking at
// No gamelogic should be executed inside setView
// including setup.
export function setView(v: View) {
  if (globalThis.headless) { return; }
  console.log('setView(', View[v], ')');
  if (globalThis.view == v) {
    // Prevent setting a view more than once if the view hasn't changed
    // Since some of these views, (such as upgrade) have
    // initialization logic
    console.log('Short circuit: View has already been set to ', View[v], 'so setView has exited without doing anything.');
    return;
  }
  for (let view of Object.keys(View)) {
    document.body?.classList.remove(`view-${view}`);
  }
  document.body?.classList.add(`view-${View[v]}`);
  globalThis.view = v;
  addPixiContainersForView(v);
  const elMenu = document.getElementById('menu') as HTMLElement;
  if (v !== View.Menu) {
    elMenu.classList.add('hidden');
    lastNonMenuView = v;
  }
  removeUnderworldEventListeners();
  // Hide the upgrade picker when the view changes
  elUpgradePicker.classList.remove('active');
  switch (v) {
    case View.Menu:
      elMenu.classList.remove('hidden');
      if (globalThis.updateInGameMenuStatus) {
        globalThis.updateInGameMenuStatus();
      }
      break;
    case View.Game:
      resizePixi();
      addUnderworldEventListeners();
      break;
    case View.Disconnected:
      // Intentionally left blank - this view is handled in css
      break;
    default:
      console.error(`Cannot set view to "${View[v]}" view is not handled in switch statement.`);
      break;
  }
  // Update the camera position when the view changes because gameLoop might not be
  // running yet (and gameLoop is what usually updates the camera position)
  updateCameraPosition();
}

// zoom camera
function zoom(e: WheelEvent) {
  if (!app) {
    return;
  }
  // TODO: This value could be customizable in the menu later:
  const scrollSensitivity = 200;
  const scrollFactor = Math.abs(e.deltaY / scrollSensitivity);
  const zoomIn = e.deltaY < 0;
  const zoomDelta = (zoomIn ? 1 + 1 * scrollFactor : 1 - 0.5 * scrollFactor);
  let newScale = app.stage.scale.x * zoomDelta;
  // Limit zoom out and in to sensible limits
  newScale = Math.min(Math.max(0.3, newScale), 4);

  globalThis.zoomTarget = newScale;
}


const endTurnBtnId = 'end-turn-btn';
function addUnderworldEventListeners() {
  if (globalThis.headless) { return; }
  // Add keyboard shortcuts
  globalThis.addEventListener('keydown', keydownListener);
  globalThis.addEventListener('keypress', keypressListener);
  globalThis.addEventListener('keyup', keyupListener);
  document.body?.addEventListener('contextmenu', contextmenuHandler);
  document.body?.addEventListener('click', clickHandler);
  globalThis.addEventListener('mousedown', mouseDownHandler);
  globalThis.addEventListener('mouseup', mouseUpHandler);
  globalThis.addEventListener('blur', onWindowBlur);
  document.body?.addEventListener('wheel', zoom);
  document.body?.addEventListener('mousemove', mouseMove);
  // Add button listeners
  const elEndTurnBtn: HTMLButtonElement = document.getElementById(
    endTurnBtnId,
  ) as HTMLButtonElement;
  elEndTurnBtn.addEventListener('click', endTurnBtnListener);

}

export function removeUnderworldEventListeners() {
  if (globalThis.headless) { return; }
  // Remove keyboard shortcuts
  globalThis.removeEventListener('keydown', keydownListener);
  globalThis.removeEventListener('keyup', keyupListener);
  // Remove mouse and click listeners
  document.body?.removeEventListener('contextmenu', contextmenuHandler);
  document.body?.removeEventListener('click', clickHandler);
  document.body?.removeEventListener('wheel', zoom);
  document.body?.removeEventListener('mousemove', mouseMove);
  // Remove button listeners
  const elEndTurnBtn: HTMLButtonElement = document.getElementById(
    endTurnBtnId,
  ) as HTMLButtonElement;
  elEndTurnBtn.removeEventListener('click', endTurnBtnListener);
}