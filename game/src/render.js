// Sizzle & Serve — every pixel the game draws. Canvas 2D only, system
// fonts only, no images: the whole kitchen is drawn in code.

import {
  VIEW_WIDTH,
  VIEW_HEIGHT,
  INGREDIENTS,
  RECIPES,
  MAX_LIVES,
  ingredientById,
  ingredientButtonRect,
  serveButtonRect,
  clearButtonRect,
  orderCardRect,
  plateCenter,
} from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(10, 18);
  ctx.bezierCurveTo(0, 10, 0, 2, 5, 2);
  ctx.bezierCurveTo(8, 2, 10, 5, 10, 5);
  ctx.bezierCurveTo(10, 5, 12, 2, 15, 2);
  ctx.bezierCurveTo(20, 2, 20, 10, 10, 18);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e5484d' : '#d8c9b0';
  ctx.fill();
  ctx.restore();
}

// One ingredient drawn as a flat, readable layer.
export function drawIngredientLayer(ctx, id, x, y, w, h) {
  const item = ingredientById(id);
  if (!item) return;
  ctx.save();
  if (id === 'bun') {
    // Golden dome with sesame seeds.
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x, y - h * 0.3, x + w / 2, y - h * 0.3);
    ctx.quadraticCurveTo(x + w, y - h * 0.3, x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[0.3, 0.25], [0.5, 0.1], [0.7, 0.25], [0.42, 0.45], [0.6, 0.45]]) {
      ctx.beginPath();
      ctx.ellipse(x + w * dx, y + h * dy, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    // Wavy green leaf.
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.6);
    for (let i = 0; i < 5; i += 1) {
      ctx.quadraticCurveTo(x + w * (i + 0.5) / 5, y - h * 0.2, x + w * (i + 1) / 5, y + h * 0.6);
    }
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.35);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
  } else if (id === 'cheese') {
    // Yellow slice with drips.
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h * 0.55);
    ctx.lineTo(x + w * 0.82, y + h);
    ctx.lineTo(x + w * 0.66, y + h * 0.55);
    ctx.lineTo(x + w * 0.5, y + h);
    ctx.lineTo(x + w * 0.34, y + h * 0.55);
    ctx.lineTo(x + w * 0.16, y + h);
    ctx.lineTo(x, y + h * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'onion') {
    // Pale rings with a purple edge.
    ctx.fillStyle = '#f3e8ff';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    for (let r = 1; r <= 3; r += 1) {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, (h / 2 - 3) * (r / 3), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = item.color;
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.35, 9, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.7, y + h * 0.35, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Patty: a thick brown slab.
    ctx.fillStyle = item.color;
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = item.dark;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(x + 24 + i * (w - 48) / 3, y + h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawKitchenBackground(ctx) {
  // Warm tiled wall.
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.strokeStyle = '#ecd9ae';
  ctx.lineWidth = 2;
  for (let y = 140; y < 560; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_WIDTH, y);
    ctx.stroke();
  }
  for (let x = 0; x < VIEW_WIDTH; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 136);
    ctx.lineTo(x, 560);
    ctx.stroke();
  }
  // Shelf with pots, just below the order board.
  ctx.fillStyle = '#8c5a2b';
  ctx.fillRect(40, 182, 340, 14);
  ctx.fillStyle = '#5b7fa6';
  ctx.beginPath();
  ctx.arc(100, 172, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(74, 172, 52, 10);
  ctx.fillStyle = '#c96f2e';
  ctx.beginPath();
  ctx.arc(200, 172, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(174, 172, 52, 10);
  ctx.fillStyle = '#7d8a4a';
  ctx.beginPath();
  ctx.arc(300, 172, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(274, 172, 52, 10);
  // Wooden counter along the bottom.
  ctx.fillStyle = '#b07a45';
  ctx.fillRect(0, 560, VIEW_WIDTH, 160);
  ctx.fillStyle = '#96622f';
  ctx.fillRect(0, 560, VIEW_WIDTH, 10);
  ctx.fillStyle = '#8a5a28';
  for (let x = 24; x < VIEW_WIDTH; x += 96) {
    ctx.fillRect(x, 640, 3, 80);
  }
}

function drawOrderBoard(ctx, game) {
  // Header band.
  ctx.fillStyle = '#8c3b2e';
  ctx.fillRect(0, 0, VIEW_WIDTH, 136);
  ctx.fillStyle = '#a34a3a';
  ctx.fillRect(0, 128, VIEW_WIDTH, 8);
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '900 15px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ORDER BOARD', 32, 12 + 2);
  // One card per order.
  game.orders.forEach((order, i) => {
    const r = orderCardRect(i);
    ctx.fillStyle = '#fff8ec';
    roundRect(ctx, r.x, r.y + 14, r.w, r.h - 14, 12);
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    ctx.font = '900 19px Arial, sans-serif';
    ctx.fillText(order.name, r.x + 14, r.y + 36);
    // Ingredient chips, in recipe order.
    order.items.forEach((id, j) => {
      const item = ingredientById(id);
      const cx = r.x + 16 + j * 66;
      const cy = r.y + 62;
      ctx.fillStyle = item.color;
      roundRect(ctx, cx, cy, 58, 22, 11);
      ctx.fill();
      ctx.fillStyle = id === 'cheese' || id === 'bun' ? '#5b3a12' : '#ffffff';
      ctx.font = '900 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.slice(0, 4), cx + 29, cy + 12);
      ctx.textAlign = 'left';
    });
    // Countdown bar.
    const frac = Math.max(0, order.timeLeft / order.timeMax);
    ctx.fillStyle = '#e3d3b8';
    roundRect(ctx, r.x + 14, r.y + 92, r.w - 28, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#f2a541' : '#e5484d';
    roundRect(ctx, r.x + 14, r.y + 92, (r.w - 28) * frac, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    ctx.font = '900 13px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(order.timeLeft)}s`, r.x + r.w - 12, r.y + 36);
    ctx.textAlign = 'left';
  });
  // HUD: score, level, lives on the right.
  const hx = 1000;
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '900 15px Arial, sans-serif';
  ctx.fillText('SCORE', hx, 30);
  ctx.font = '900 34px Arial, sans-serif';
  ctx.fillText(String(game.score), hx, 62);
  ctx.font = '900 15px Arial, sans-serif';
  ctx.fillText(`LEVEL ${game.level}`, hx, 100);
  for (let i = 0; i < MAX_LIVES; i += 1) {
    drawHeart(ctx, 1152 + i * 36, 88, 26, i < game.lives);
  }
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '900 13px Arial, sans-serif';
  ctx.fillText('LIVES', 1152, 62);
}

function drawMenuBoard(ctx) {
  ctx.fillStyle = '#33413a';
  roundRect(ctx, 40, 200, 340, 330, 10);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 200, 340, 330, 10);
  ctx.stroke();
  ctx.fillStyle = '#fff8ec';
  ctx.font = '900 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("TODAY'S MENU", 210, 232);
  ctx.font = '700 15px Arial, sans-serif';
  ctx.textAlign = 'left';
  RECIPES.forEach((recipe, i) => {
    const y = 268 + i * 42;
    ctx.fillStyle = '#ffd97a';
    ctx.fillText(recipe.name, 60, y);
    ctx.fillStyle = '#d8e6d0';
    ctx.font = '700 13px Arial, sans-serif';
    ctx.fillText(recipe.items.map((id) => ingredientById(id).name).join(' + '), 60, y + 17);
    ctx.font = '700 15px Arial, sans-serif';
  });
  ctx.textAlign = 'left';
}

function drawPlate(ctx, game) {
  const c = plateCenter();
  // Plate.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + 60, 230, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c9b0';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f0e6d2';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + 58, 180, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stacked ingredients, bottom-up.
  const layerH = 30;
  const layerW = 300;
  game.plate.forEach((id, i) => {
    const y = c.y + 52 - (i + 1) * layerH;
    drawIngredientLayer(ctx, id, c.x - layerW / 2, y, layerW, layerH);
  });
  if (game.plate.length === 0) {
    ctx.fillStyle = '#8a7a5f';
    ctx.font = '700 17px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click ingredients below to build a dish', c.x, c.y + 20);
    ctx.textAlign = 'left';
  }
  // Labels.
  ctx.fillStyle = '#2b2118';
  ctx.font = '900 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR PLATE', c.x, c.y - 130);
  ctx.textAlign = 'left';
  if (game.plate.length > 0) {
    const names = game.plate.map((id) => ingredientById(id).name).join(' + ');
    ctx.fillStyle = '#5b4a33';
    ctx.font = '700 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(names, c.x, c.y + 118);
    ctx.textAlign = 'left';
  }
}

function drawServeButtons(ctx, game) {
  const serve = serveButtonRect();
  const ready = game.plate.length > 0;
  ctx.fillStyle = ready ? '#e5484d' : '#b09a7d';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SERVE!', serve.x + serve.w / 2, serve.y + 46);
  ctx.font = '700 15px Arial, sans-serif';
  ctx.fillText('SPACE / ENTER', serve.x + serve.w / 2, serve.y + 82);
  ctx.textAlign = 'left';

  const clear = clearButtonRect();
  ctx.fillStyle = '#8c7a5f';
  roundRect(ctx, clear.x, clear.y, clear.w, clear.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 17px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLEAR PLATE  (BKSP)', clear.x + clear.w / 2, clear.y + 36);
  ctx.textAlign = 'left';

  // Flash feedback on a serve.
  if (game.servedFlash > 0) {
    ctx.fillStyle = `rgba(88, 179, 104, ${game.servedFlash})`;
    ctx.fillRect(0, 136, VIEW_WIDTH, 424);
  }
  if (game.wrongFlash > 0) {
    ctx.fillStyle = `rgba(229, 72, 77, ${game.wrongFlash * 0.7})`;
    ctx.fillRect(0, 136, VIEW_WIDTH, 424);
  }
}

function drawIngredientButtons(ctx) {
  INGREDIENTS.forEach((item, i) => {
    const r = ingredientButtonRect(i);
    ctx.fillStyle = '#fff8ec';
    roundRect(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 3;
    roundRect(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.stroke();
    drawIngredientLayer(ctx, item.id, r.x + 30, r.y + 14, r.w - 60, 34);
    ctx.fillStyle = '#2b2118';
    ctx.font = '900 17px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, r.x + r.w / 2, r.y + 76);
    ctx.fillStyle = '#8a7a5f';
    ctx.font = '700 13px Arial, sans-serif';
    ctx.fillText(`press ${item.key}`, r.x + r.w / 2, r.y + 94);
    ctx.textAlign = 'left';
  });
}

function drawMessageToast(ctx, game) {
  if (game.messageTimer <= 0 || !game.message) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, game.messageTimer);
  ctx.fillStyle = '#2b2118';
  const w = ctx.measureText(game.message).width + 48;
  roundRect(ctx, VIEW_WIDTH / 2 - w / 2 - 140, 150, w + 280, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '700 17px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.message, VIEW_WIDTH / 2, 171);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawTitleScreen(ctx, game) {
  ctx.fillStyle = 'rgba(43, 33, 24, 0.82)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = '#ffc93c';
  ctx.font = '900 84px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SIZZLE & SERVE', VIEW_WIDTH / 2, 220);
  ctx.fillStyle = '#fff8ec';
  ctx.font = '700 26px Arial, sans-serif';
  ctx.fillText('A tiny cooking game — build the dish, beat the clock', VIEW_WIDTH / 2, 268);
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillStyle = '#ffd97a';
  ctx.fillText('Orders appear on the board. Click ingredients (or press 1-6)', VIEW_WIDTH / 2, 340);
  ctx.fillText('to stack them on your plate, then hit SERVE (or SPACE).', VIEW_WIDTH / 2, 372);
  ctx.fillText('Wrong dish or an expired order costs a life. You have 3.', VIEW_WIDTH / 2, 404);
  const pulse = 0.6 + 0.4 * Math.sin(game.elapsed * 4);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#e5484d';
  roundRect(ctx, VIEW_WIDTH / 2 - 190, 452, 380, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px Arial, sans-serif';
  ctx.fillText('CLICK TO START', VIEW_WIDTH / 2, 493);
  ctx.restore();
  ctx.fillStyle = '#d8c9b0';
  ctx.font = '700 15px Arial, sans-serif';
  ctx.fillText('Keyboard: 1-6 add ingredients · SPACE serve · BKSP clear · R restart', VIEW_WIDTH / 2, 580);
  ctx.textAlign = 'left';
}

function drawGameOverScreen(ctx, game) {
  ctx.fillStyle = 'rgba(43, 33, 24, 0.85)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = '#e5484d';
  ctx.font = '900 72px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("TIME'S UP!", VIEW_WIDTH / 2, 250);
  ctx.fillStyle = '#fff8ec';
  ctx.font = '700 26px Arial, sans-serif';
  ctx.fillText(`Final score: ${game.score}   ·   Dishes served: ${game.served}   ·   Level ${game.level}`, VIEW_WIDTH / 2, 320);
  const pulse = 0.6 + 0.4 * Math.sin(game.elapsed * 4);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#58b368';
  roundRect(ctx, VIEW_WIDTH / 2 - 210, 380, 420, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px Arial, sans-serif';
  ctx.fillText('PLAY AGAIN  (R)', VIEW_WIDTH / 2, 421);
  ctx.restore();
  ctx.textAlign = 'left';
}

export function renderGame(ctx, game) {
  drawKitchenBackground(ctx);
  drawOrderBoard(ctx, game);
  drawMenuBoard(ctx);
  drawPlate(ctx, game);
  drawServeButtons(ctx, game);
  drawIngredientButtons(ctx);
  drawMessageToast(ctx, game);
  if (game.screen === 'title') drawTitleScreen(ctx, game);
  if (game.screen === 'over') drawGameOverScreen(ctx, game);
}
