# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the app entry point and loads the canvas UI plus every browser script in order. Core simulation logic lives in `scripts/`, with `game.js` driving the main loop, `elements.js` defining element behavior, and focused modules such as `menu.js`, `spigots.js`, `softBody.js`, and `zombies.js` handling specific systems. Shared styles live in `styles.css`, static assets live in `assets/`, and player-facing notes live in `README.md` and `TIPS.md`.

## Build, Test, and Development Commands
This repository does not use a package manager or checked-in build script. For local development, open `index.html` in a browser, or serve the repo root with a simple static server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`. If you need a production minified build, use the Closure Compiler support under `scripts/closure-compiler/` and document the exact command in your PR.

## Coding Style & Naming Conventions
Match the existing style: 2-space indentation in HTML/CSS, semicolon-terminated JavaScript, and double quotes for strings. Prefer descriptive camelCase for variables and functions such as `initElements` or `updateGame`, and reserve ALL_CAPS for shared constants like `MAX_X_IDX`. Keep performance-sensitive code straightforward; this project intentionally favors explicit logic over extra abstraction in hot paths.

## Testing Guidelines
There is no automated test suite in the repository today. Verify changes by running the game in a browser and exercising the affected mechanics directly. For simulation changes, test element interactions, menu controls, save/load behavior, and frame-rate stability. If you add automated coverage, keep test files near the code they verify or under a small top-level `tests/` directory.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects such as `Add zombies` and `Adjust zombie menu interaction`. Follow that pattern and keep each commit focused on one change. Pull requests should include a brief summary, manual test notes, and screenshots or short recordings for UI or gameplay changes. Link related issues when applicable and call out any performance impact.

## Contributor Notes
Keep changes surgical. Avoid introducing new tooling, frameworks, or large refactors unless the task requires them. When adding a new element, update the declarations and action wiring in `scripts/elements.js`, then verify the behavior in-game.
