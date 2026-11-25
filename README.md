# Sizzle & Serve

[![make.fun bounty](https://make.fun/bounty/best-cooking-game-20261125-0137)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A tiny original cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). No build step, no network: open `game/index.html` in a desktop browser and play.

## How to play

Orders appear on the board at the top, each with its own countdown timer.
Click ingredients on the counter (or press keys **1–6**) to stack them on
your plate, then hit **SERVE!** (or **Space** / **Enter**).

- Serve the exact dish an order asks for: **+100 points** plus a time bonus.
- Serve the wrong dish, or let an order expire: **lose a life**. You have 3.
- Every 4 dishes served raises the **level**: orders arrive faster and their
  timers get shorter.
- **Backspace** clears the plate. **R** restarts after game over.

## Files

- `game/index.html` — the page: one canvas, one module script.
- `game/src/main.js` — bootstrap and the game loop.
- `game/src/state.js` — rules: orders, score, lives, level, the plate.
- `game/src/input.js` — mouse and keyboard.
- `game/src/render.js` — everything drawn on the canvas.
- `game/src/audio.js` — WebAudio bleeps (synthesised, no sound files).
- `main.ts` — hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` (Node 22 stdlib only).

## Run it

Serve `game/` with any static server, for example:

```sh
cd game && python3 -m http.server 8080
```

Then open http://localhost:8080 in desktop Chrome. Add
`?scene=play`, `?scene=serve` or `?scene=end` to jump straight to a staged
moment (used for the screenshots in `screenshots/`).

## License

MIT — see `LICENSE`.
