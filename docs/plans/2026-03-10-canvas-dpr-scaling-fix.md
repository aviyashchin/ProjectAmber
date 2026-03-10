# Canvas DPR Scaling Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the game viewport so high-DPI displays render at the correct scale without making the playfield appear zoomed in.

**Architecture:** Keep the simulation canvas at game resolution and handle device-pixel-ratio only on the onscreen canvas. Add a minimal regression check that exercises the canvas sizing math and draw pipeline assumptions without changing unrelated gameplay code.

**Tech Stack:** Plain browser JavaScript, HTML canvas, PowerShell for verification

---

### Task 1: Add a failing regression check for canvas scaling

**Files:**
- Create: `tests/canvasScaling.test.js`
- Create: `tests/run-canvas-scaling-test.js`

**Step 1: Write the failing test**

Create a small Node-based assertion script that models the current canvas sizing behavior for a device pixel ratio greater than `1` and asserts that the offscreen context is not scaled during each draw.

**Step 2: Run test to verify it fails**

Run: `node tests/run-canvas-scaling-test.js`
Expected: FAIL because the current draw path applies scaling on the offscreen context.

**Step 3: Write minimal implementation**

No production changes in this task.

**Step 4: Run test to verify it still fails**

Run: `node tests/run-canvas-scaling-test.js`
Expected: FAIL

### Task 2: Fix the DPR rendering path

**Files:**
- Modify: `scripts/game.js`

**Step 1: Write the failing test**

Use the regression check from Task 1.

**Step 2: Run test to verify it fails**

Run: `node tests/run-canvas-scaling-test.js`
Expected: FAIL

**Step 3: Write minimal implementation**

Update the onscreen canvas setup and draw path so DPR scaling is applied once to the onscreen context instead of accumulating on the offscreen game context.

**Step 4: Run test to verify it passes**

Run: `node tests/run-canvas-scaling-test.js`
Expected: PASS

### Task 3: Verify browser-facing behavior

**Files:**
- Modify: `scripts/game.js`

**Step 1: Run targeted verification**

Run a quick local server and inspect the game manually in a browser to confirm the viewport matches the footer scale and pointer interactions remain aligned.

**Step 2: Re-run automated regression check**

Run: `node tests/run-canvas-scaling-test.js`
Expected: PASS

**Step 3: Commit**

```bash
git add docs/plans/2026-03-10-canvas-dpr-scaling-fix.md tests/canvasScaling.test.js tests/run-canvas-scaling-test.js scripts/game.js
git commit -m "Fix canvas DPR scaling"
```
