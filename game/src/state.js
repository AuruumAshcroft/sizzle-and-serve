// Sizzle & Serve — game state: orders, score, lives, level and the plate.
// One job only: hold the rules and the numbers. No drawing, no input here.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;

export const MAX_LIVES = 3;
export const MAX_ORDERS = 3;
export const MAX_PLATE_ITEMS = 6;
export const SERVES_PER_LEVEL = 4;

// The six ingredients on the counter. Key is the keyboard shortcut.
export const INGREDIENTS = [
  { id: 'bun', name: 'BUN', key: '1', color: '#f2b25c', dark: '#c98a2e' },
  { id: 'patty', name: 'PATTY', key: '2', color: '#7a4a21', dark: '#5a3413' },
  { id: 'lettuce', name: 'LETTUCE', key: '3', color: '#58b368', dark: '#2f7d3d' },
  { id: 'tomato', name: 'TOMATO', key: '4', color: '#e5484d', dark: '#b3272e' },
  { id: 'cheese', name: 'CHEESE', key: '5', color: '#ffc93c', dark: '#e0a100' },
  { id: 'onion', name: 'ONION', key: '6', color: '#b388eb', dark: '#7e57c2' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

// Recipes: every order is one dish made of 3-4 ingredients.
export const RECIPES = [
  { name: 'CLASSIC BURGER', items: ['bun', 'patty', 'lettuce', 'tomato'] },
  { name: 'CHEESE BURGER', items: ['bun', 'patty', 'cheese', 'tomato'] },
  { name: 'GARDEN STACK', items: ['bun', 'lettuce', 'tomato', 'onion'] },
  { name: 'PATTY MELT', items: ['bun', 'patty', 'cheese', 'onion'] },
  { name: 'GREEN DELIGHT', items: ['lettuce', 'tomato', 'onion', 'cheese'] },
  { name: 'DOUBLE TROUBLE', items: ['bun', 'patty', 'patty', 'cheese'] },
];

export function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

// ---- layout: single source of truth for every hit box and drawing slot ----

export function ingredientButtonRect(index) {
  const w = 160;
  const h = 104;
  const gap = 20;
  const total = INGREDIENTS.length * w + (INGREDIENTS.length - 1) * gap;
  const x = (VIEW_WIDTH - total) / 2 + index * (w + gap);
  return { x, y: 584, w, h };
}

export function serveButtonRect() {
  return { x: 1016, y: 218, w: 224, h: 116 };
}

export function clearButtonRect() {
  return { x: 1016, y: 350, w: 224, h: 56 };
}

export function orderCardRect(index) {
  return { x: 32 + index * 322, y: 16, w: 302, h: 104 };
}

export function plateCenter() {
  return { x: 600, y: 372 };
}

// ---- game state ----

export function createGame() {
  return {
    screen: 'title', // 'title' | 'playing' | 'over'
    score: 0,
    lives: MAX_LIVES,
    level: 1,
    served: 0,
    plate: [],
    orders: [],
    spawnTimer: 2.0,
    elapsed: 0,
    message: '',
    messageTimer: 0,
    servedFlash: 0,
    wrongFlash: 0,
  };
}

export function orderTimeLimit(level) {
  return Math.max(14, 30 - (level - 1) * 2);
}

export function spawnInterval(level) {
  return Math.max(3.5, 6.5 - (level - 1) * 0.5);
}

export function spawnOrder(game) {
  if (game.orders.length >= MAX_ORDERS) return;
  const recipe = randomRecipe();
  game.orders.push({
    name: recipe.name,
    items: [...recipe.items],
    timeLeft: orderTimeLimit(game.level),
    timeMax: orderTimeLimit(game.level),
  });
}

export function startGame(game) {
  game.screen = 'playing';
  game.score = 0;
  game.lives = MAX_LIVES;
  game.level = 1;
  game.served = 0;
  game.plate = [];
  game.orders = [];
  game.spawnTimer = 1.2;
  game.elapsed = 0;
  game.message = 'Serve the orders before time runs out!';
  game.messageTimer = 3;
  spawnOrder(game);
  spawnOrder(game);
}

export function addIngredient(game, id) {
  if (game.screen !== 'playing') return false;
  if (game.plate.length >= MAX_PLATE_ITEMS) return false;
  game.plate.push(id);
  return true;
}

export function clearPlate(game) {
  game.plate = [];
}

export function sameDish(a, b) {
  if (a.length !== b.length) return false;
  const counts = {};
  for (const item of a) counts[item] = (counts[item] || 0) + 1;
  for (const item of b) {
    if (!counts[item]) return false;
    counts[item] -= 1;
  }
  return true;
}

export function findMatchingOrder(game) {
  return game.orders.findIndex((order) => sameDish(order.items, game.plate));
}

// Serve the plate. Returns 'served', 'wrong' or 'empty'.
export function servePlate(game) {
  if (game.screen !== 'playing') return 'empty';
  if (game.plate.length === 0) return 'empty';
  const match = findMatchingOrder(game);
  if (match >= 0) {
    const order = game.orders[match];
    const bonus = Math.round(order.timeLeft) * 5;
    game.score += 100 + bonus;
    game.served += 1;
    game.level = Math.floor(game.served / SERVES_PER_LEVEL) + 1;
    game.orders.splice(match, 1);
    game.plate = [];
    game.message = `Served! +${100 + bonus} points`;
    game.messageTimer = 2;
    game.servedFlash = 0.6;
    return 'served';
  }
  game.lives -= 1;
  game.plate = [];
  game.message = 'Wrong dish! The customer walks away...';
  game.messageTimer = 2;
  game.wrongFlash = 0.6;
  if (game.lives <= 0) {
    game.screen = 'over';
  }
  return 'wrong';
}

export function updateGame(game, dt) {
  if (game.screen !== 'playing') return;
  game.elapsed += dt;
  if (game.messageTimer > 0) game.messageTimer -= dt;
  if (game.servedFlash > 0) game.servedFlash -= dt;
  if (game.wrongFlash > 0) game.wrongFlash -= dt;

  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnOrder(game);
    game.spawnTimer = spawnInterval(game.level);
  }

  for (let i = game.orders.length - 1; i >= 0; i -= 1) {
    const order = game.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      game.orders.splice(i, 1);
      game.lives -= 1;
      game.message = 'An order expired! A customer leaves angry...';
      game.messageTimer = 2;
      game.wrongFlash = 0.6;
      if (game.lives <= 0) {
        game.screen = 'over';
      }
    }
  }
}
