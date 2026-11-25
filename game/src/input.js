// Sizzle & Serve — mouse and keyboard input. Hit-testing reads the same
// layout rectangles render.js draws, so a click always lands where it looks.

import {
  VIEW_WIDTH,
  VIEW_HEIGHT,
  INGREDIENTS,
  ingredientButtonRect,
  serveButtonRect,
  clearButtonRect,
} from './state.js';

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (VIEW_WIDTH / rect.width),
    y: (event.clientY - rect.top) * (VIEW_HEIGHT / rect.height),
  };
}

// handlers: onStart, onRestart, onAdd(id), onServe, onClear
export function attachInput(canvas, game, handlers) {
  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(canvas, event);
    if (game.screen === 'title') {
      handlers.onStart();
      return;
    }
    if (game.screen === 'over') {
      handlers.onRestart();
      return;
    }
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (pointInRect(p.x, p.y, ingredientButtonRect(i))) {
        handlers.onAdd(INGREDIENTS[i].id);
        return;
      }
    }
    if (pointInRect(p.x, p.y, serveButtonRect())) {
      handlers.onServe();
      return;
    }
    if (pointInRect(p.x, p.y, clearButtonRect())) {
      handlers.onClear();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (game.screen === 'title') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlers.onStart();
      }
      return;
    }
    if (game.screen === 'over') {
      if (event.key === 'r' || event.key === 'R' || event.key === 'Enter') {
        handlers.onRestart();
      }
      return;
    }
    const byKey = INGREDIENTS.find((item) => item.key === event.key);
    if (byKey) {
      handlers.onAdd(byKey.id);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handlers.onServe();
      return;
    }
    if (event.key === 'Backspace') {
      handlers.onClear();
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      handlers.onRestart();
    }
  });
}
