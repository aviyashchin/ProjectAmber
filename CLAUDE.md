# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Amber (originally "Project Sand") is a modern HTML5 falling-sand simulation game. It reproduces and extends the classic "Hell of Sand Falling Game" using canvas pixel manipulation. The game operates on ~250,000 pixels at 60-120 FPS in a single thread.

## Development

No build system or package manager. Serve the repo root with any static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. The entry point is `index.html`, which loads all scripts in dependency order via `<script>` tags.

For production minification, use Closure Compiler support under `scripts/closure-compiler/`.

## Running Tests

Tests are Node.js scripts (no test framework). Each test file has a corresponding runner:

```bash
node tests/run-canvas-scaling-test.js
node tests/run-menu-grouping-test.js
node tests/run-bellamy-universe-test.js
```

Tests do source-level analysis (reading JS files and asserting patterns) rather than running the game in a browser.

## Architecture

**Script load order matters** — scripts are loaded sequentially in `index.html` and depend on globals from earlier scripts:

1. `third_party/matter.min.js` — physics engine for soft bodies
2. `util.js` — shared utilities and random number helpers
3. `canvasConfig.js` — global canvas dimensions (`width`, `height`), FPS constants, zombie limits
4. `cursor.js` — mouse/touch input handling
5. `particles.js` — particle effect system
6. `elements.js` — element definitions, colors, and interaction logic
7. `spigots.js` — element emitter controls
8. `menu.js` — UI palette and options panel
9. `tooltips.js` — element info tooltips
10. `softBody.js` — Matter.js-based soft body simulation
11. `zombies.js` — zombie entity system
12. `temperature.js` — temperature/sun exposure simulation (Bellamy universe)
13. `game.js` — main loop (`updateGame()`), canvas setup, rendering, save/load

**Element system** (`elements.js`): Elements are identified by 32-bit colors in a Uint32Array. The lowest 2 bits of R, G, B channels encode an element index (6 bits = up to 64 elements). This avoids dictionary lookups in the hot path. To add a new element:
1. Define its color with `__inGameColor(r, g, b)`
2. Add entries to `elements` and `elementActions` arrays (order must match declaration order)
3. If gas-permeable, add to `GAS_PERMEABLE` in `initElements()`
4. Implement its action function taking `(x, y, i)`

**Dual-canvas rendering**: An offscreen canvas at game resolution is drawn to a Uint32Array (`gameImagedata32`), then scaled and blitted to the visible canvas which accounts for `devicePixelRatio`.

**Main loop**: `game.js:updateGame()` is the entry point for the game loop. It processes all pixels, applies element actions, handles rendering, and manages FPS.

## Coding Conventions

- 2-space indentation in HTML/CSS, semicolons in JS, double quotes for strings
- camelCase for variables/functions, ALL_CAPS for constants (e.g., `MAX_X_IDX`)
- Performance-critical code favors explicit logic over abstraction: arrays over objects, `!==` over `<` in loops, pre-computed random values, duplicated code branches in hot paths, `const` wherever possible
- Many variables are intentionally global for performance
- Commits use short imperative subjects (e.g., "Add zombies", "Adjust zombie menu interaction")
