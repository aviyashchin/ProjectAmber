# Tilt Debug Harness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a visible in-game tilt debug panel and a repeatable Playwright-driven browser test flow so tilt behavior can be tested across the full canvas without the console.

**Architecture:** Keep the current fast pixel engine unchanged and keep `family32` as the only live tilt strategy. Add only menu-side debug controls plus browser-driving notes so testing becomes reproducible without introducing new simulation systems.

**Tech Stack:** Plain HTML, existing browser JavaScript modules, existing string-based regression tests under `tests/`, and Playwright CLI for manual browser automation.

---

### Task 1: Add failing tests for the debug panel surface

**Files:**
- Modify: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions for:

- `index.html` containing a `Tilt Debug` section
- a bucket slider element
- a strength slider element
- preset buttons for scenes and directions
- `scripts/menu.js` wiring those controls to the existing tilt hooks

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`

Expected: FAIL because the new debug panel controls do not exist yet

**Step 3: Write minimal implementation**

Do not implement yet. Stop after the failing test and move to Task 2.

**Step 4: Run test to verify it still fails correctly**

Run: `node tests/run-bellamy-universe-test.js`

Expected: same FAIL message about the missing tilt debug controls

**Step 5: Commit**

Do not commit yet. Bundle with the UI implementation in Task 3.

### Task 2: Add the debug panel markup and styles

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Step 1: Write the failing test**

Use the failing assertions from Task 1 as the active red state.

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`

Expected: FAIL because the markup is not present yet

**Step 3: Write minimal implementation**

Add a compact `Tilt Debug` block to the existing menu area with:

- `tiltModeCheckbox`
- `tiltBucketSlider`
- `tiltStrengthSlider`
- text readouts for bucket and strength
- direction preset buttons
- scene preset buttons

Style it to match the existing menu cards without changing unrelated layout.

**Step 4: Run test to verify partial progress**

Run: `node tests/run-bellamy-universe-test.js`

Expected: FAIL moves from missing markup to missing wiring

**Step 5: Commit**

Do not commit yet. Bundle with Task 3 once wiring is complete.

### Task 3: Wire the debug panel to the existing tilt runtime

**Files:**
- Modify: `scripts/menu.js`
- Modify: `scripts/game.js`

**Step 1: Write the failing test**

Use the existing red test from Task 2 and extend if needed so it checks:

- bucket slider calls `setTiltBenchmarkState(...)`
- strength slider calls `setTiltBenchmarkState(...)`
- direction buttons call `setTiltGravityVector(...)`
- scene buttons call `loadBenchmarkScene(...)`
- readouts update after UI interaction

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`

Expected: FAIL because the controls are not wired yet

**Step 3: Write minimal implementation**

In `scripts/menu.js`, wire the new controls to the existing runtime hooks.

In `scripts/game.js`, add tiny helper functions if needed so UI state can refresh readouts without new simulation overhead.

Keep all behavior out of the hot loop.

**Step 4: Run test to verify it passes**

Run: `node tests/run-bellamy-universe-test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add index.html styles.css scripts/menu.js scripts/game.js tests/bellamyUniverse.test.js
git commit -m "feat(ui): add tilt debug harness"
```

### Task 4: Refresh the manual benchmark notes for UI-first testing

**Files:**
- Modify: `tests/tiltGravityBenchmarkNotes.md`

**Step 1: Write the failing test**

Extend `tests/bellamyUniverse.test.js` so the notes mention:

- using the visible tilt debug controls
- loading preset scenes
- comparing buckets with the new UI

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`

Expected: FAIL because the notes still describe the old flow

**Step 3: Write minimal implementation**

Update the notes so they describe the UI-first testing flow and keep the core comparison scenes.

**Step 4: Run test to verify it passes**

Run: `node tests/run-bellamy-universe-test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/tiltGravityBenchmarkNotes.md tests/bellamyUniverse.test.js
git commit -m "docs: update tilt debug benchmark notes"
```

### Task 5: Verify the full regression suite

**Files:**
- Modify: none unless failures appear

**Step 1: Write the failing test**

No new test. Use the current suite as the gate.

**Step 2: Run test to verify failures if any**

Run:

```bash
node tests/run-bellamy-universe-test.js
node tests/run-menu-grouping-test.js
node tests/run-canvas-scaling-test.js
node --check scripts/game.js
node --check scripts/menu.js
node --check scripts/elements.js
```

Expected: all PASS / clean syntax

**Step 3: Write minimal implementation**

Only fix issues directly revealed by verification.

**Step 4: Run test to verify it passes**

Re-run the same commands and confirm they are green.

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify tilt debug harness"
```

### Task 6: Run a headed browser check with Playwright CLI

**Files:**
- Modify: none unless a real UI bug is found

**Step 1: Write the failing test**

No checked-in automated test file is required. This is a manual-but-repeatable browser verification step.

**Step 2: Run test to verify behavior**

Use Playwright CLI in a headed browser to:

1. open the locally served app
2. toggle tilt on
3. load the `Sand` scene
4. compare bucket values such as `2` and `4`
5. capture screenshots or observations

Expected: the panel is usable without the console and the page remains responsive

**Step 3: Write minimal implementation**

Only if the browser run exposes a real bug.

**Step 4: Run test to verify it passes**

Repeat the browser flow after any fix.

**Step 5: Commit**

Only commit if the browser verification required a code fix.
