# Platform Seam Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a small browser-backed platform seam for haptics and device hooks without changing the Bellamy simulation loop.

**Architecture:** Introduce a single `scripts/platform.js` module that owns browser haptics and device wrappers. Wire existing UI and tilt code through that adapter so later native integrations can replace one module instead of many call sites.

**Tech Stack:** Plain browser JavaScript, existing Bellamy regression tests, browser vibration and orientation APIs

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `tests/bellamyUniverse.test.js`
- Modify: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add assertions for:
- `index.html` loading `scripts/platform.js`
- `scripts/platform.js` defining a shared platform object with `haptics` and `device`
- Bellamy menu wiring using `window.projectAmberPlatform`
- Bellamy runtime calling platform haptics hooks

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL because the new platform seam is not implemented yet.

### Task 2: Add the browser-backed adapter

**Files:**
- Create: `scripts/platform.js`
- Modify: `index.html`

**Step 1: Write minimal implementation**

Add a global `window.projectAmberPlatform` object with:
- `haptics.init()`
- `haptics.toggle()`
- `haptics.light()`
- `haptics.medium()`
- `haptics.heavy()`
- `haptics.draw()`
- `device.enableTilt()`
- `device.lockOrientation()`
- `device.unlockOrientation()`

All methods should no-op safely when unsupported.

**Step 2: Run regression to verify it passes**

Run: `node tests/run-bellamy-universe-test.js`
Expected: the platform-specific assertions now pass or move failure to the next missing wiring.

### Task 3: Wire Bellamy UI and runtime through the seam

**Files:**
- Modify: `index.html`
- Modify: `scripts/menu.js`
- Modify: `scripts/game.js`
- Modify: `scripts/cursor.js`

**Step 1: Write minimal implementation**

- Add a simple haptics toggle button in the Bellamy options area
- Initialize the platform adapter during startup
- Route tilt enablement through `projectAmberPlatform.device.enableTilt()`
- Route gentle draw and button taps through `projectAmberPlatform.haptics`

**Step 2: Run regression to verify it passes**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

### Task 4: Final verification

**Files:**
- No new files

**Step 1: Run checks**

Run:
- `node tests/run-bellamy-universe-test.js`
- `node tests/run-menu-grouping-test.js`
- `node tests/run-canvas-scaling-test.js`
- `node --check scripts/platform.js`
- `node --check scripts/menu.js`
- `node --check scripts/game.js`
- `node --check scripts/cursor.js`

Expected: all pass cleanly.
