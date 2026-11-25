// Sizzle & Serve — bootstrap and game loop. Owns the animation frame,
// the screen flow and the wiring between state, input, render and audio.

import { VIEW_WIDTH, VIEW_HEIGHT, createGame, startGame, addIngredient, clearPlate, servePlate, updateGame, spawnOrder } from './state.js';
import { renderGame } from './render.js';
import { attachInput } from './input.js';
import { ensureAudio, soundAdd, soundServeGood, soundServeBad, soundClick, soundGameOver } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();

// Staged scenes for screenshots: ?scene=start | play | serve | end.
// The game itself is unchanged — the scene just pre-plays a few moves.
export function stageScene(name) {
  if (name === 'play') {
    startGame(game);
    game.orders = [
      { name: 'CLASSIC BURGER', items: ['bun', 'patty', 'lettuce', 'tomato'], timeLeft: 24, timeMax: 30 },
      { name: 'CHEESE BURGER', items: ['bun', 'patty', 'cheese', 'tomato'], timeLeft: 16, timeMax: 30 },
      { name: 'GARDEN STACK', items: ['bun', 'lettuce', 'tomato', 'onion'], timeLeft: 8, timeMax: 30 },
    ];
    game.plate = ['bun', 'patty', 'lettuce'];
    game.score = 250;
    game.level = 2;
    game.served = 5;
    game.message = '';
    game.messageTimer = 0;
  } else if (name === 'serve') {
    startGame(game);
    game.orders = [
      { name: 'CLASSIC BURGER', items: ['bun', 'patty', 'lettuce', 'tomato'], timeLeft: 21, timeMax: 30 },
      { name: 'PATTY MELT', items: ['bun', 'patty', 'cheese', 'onion'], timeLeft: 12, timeMax: 30 },
    ];
    game.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    game.score = 480;
    game.level = 2;
    game.served = 6;
    game.message = 'Ready to serve — a perfect Classic Burger!';
    game.messageTimer = 60;
  } else if (name === 'end') {
    startGame(game);
    game.screen = 'over';
    game.score = 1250;
    game.served = 9;
    game.level = 3;
    game.lives = 0;
    game.plate = [];
    game.message = '';
    game.messageTimer = 0;
  }
  // 'start' (and anything else) keeps the plain title screen.
}

function handleAdd(id) {
  if (addIngredient(game, id)) {
    ensureAudio();
    soundAdd();
  }
}

function handleServe() {
  const result = servePlate(game);
  ensureAudio();
  if (result === 'served') soundServeGood();
  else if (result === 'wrong') soundServeBad();
  if (game.screen === 'over') soundGameOver();
}

attachInput(canvas, game, {
  onStart: () => {
    ensureAudio();
    soundClick();
    startGame(game);
  },
  onRestart: () => {
    ensureAudio();
    soundClick();
    startGame(game);
  },
  onAdd: handleAdd,
  onServe: handleServe,
  onClear: () => {
    clearPlate(game);
    soundClick();
  },
});

const params = new URLSearchParams(window.location.search);
stageScene(params.get('scene') || 'start');
window.__sizzle = { game, stageScene, spawnOrder };

let lastTime = performance.now();

export function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  game.elapsed += dt;
  updateGame(game, dt);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  renderGame(ctx, game);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
