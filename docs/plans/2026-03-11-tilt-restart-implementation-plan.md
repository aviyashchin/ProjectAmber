# Tilt Restart Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild tilt behavior from the stable `c8217f4` base so Tilt never freezes, bucket `0` matches vanilla downward behavior, nearby buckets diverge cleanly, and liquids/solids remain responsive without sacrificing the original fast pixel loop.

**Architecture:** Keep the current hand-optimized bitmap simulation and one main update sweep. Make tilt changes only at the traversal-choice and local-neighbor helper level. Avoid per-frame allocations, extra full-grid passes, radius scans, or per-pixel mass state. Use the stable Bellamy/preview behavior as the quality baseline and rebuild tilt incrementally with TDD.

**Tech Stack:** Plain browser JavaScript, HTML canvas, Node-based string/regression tests in `tests/`, static hosting via simple HTTP server / Vercel preview.

---

### Task 1: Capture The Stable Tilt Contract

**Files:**
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add a regression section that encodes the restart constraints:

```js
assert(
  gameSource.includes("if (mode === \"default\" || mode === \"baseline\")"),
  "syncFrameGravity should keep a true baseline path"
);

assert(
  !elementsSource.includes("doLiquidFlow("),
  "tilt restart should begin from the stable base without the broken liquid block-flow experiment"
);

assert(
  gameSource.includes("if (absDx > absDy)") &&
  gameSource.includes("updateGameColumns(") &&
  gameSource.includes("updateGameRows("),
  "tilt restart should keep dominant-axis traversal as the baseline shape"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL because the new restart assertions do not exist yet.

**Step 3: Write minimal implementation**

Add the assertions only. Do not change runtime code in this task.

**Step 4: Run test to verify it passes**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/bellamyUniverse.test.js
git commit -m "test: capture tilt restart baseline"
```

### Task 2: Reproduce Tilt Freeze In The Restart Worktree

**Files:**
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`
- Reference: `scripts/menu.js`
- Reference: `scripts/game.js`

**Step 1: Write the failing test**

Add a targeted regression around the known freeze suspects:

```js
assert(
  menuSource.includes("enableTiltMotionInBackground()") &&
  !menuSource.includes("await window.projectAmberPlatform.device.enableTilt()"),
  "tilt toggle should not block on sensor permission"
);

assert(
  !elementsSource.includes("primaryFlat: __buildFlatOffsets("),
  "restart base should not yet cache or rebuild extra family32 tables until the new fix is designed"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL if the assertions are not present yet.

**Step 3: Reproduce manually**

Run:

```bash
python -m http.server 8000
```

Open `http://127.0.0.1:8000` and verify:
- Tilt toggle does not hang the UI before any scene is drawn
- Bucket `0` falls straight down
- Old preview remains the quality reference

**Step 4: Record observations in the plan file comments or working notes**

Write down:
- Does Tilt freeze on empty canvas?
- Does it freeze only with sand/water present?
- Does bucket `0` already match vanilla?

**Step 5: Commit**

```bash
git add tests/bellamyUniverse.test.js
git commit -m "test: document tilt freeze reproduction points"
```

### Task 3: Make Family32 Per-Frame Setup Allocation-Free

**Files:**
- Modify: `scripts/elements.js`
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add a regression that requires cached family32 tables:

```js
assert(
  elementsSource.includes("primaryFlat: __buildFlatOffsets(primaryOffsets, false)") &&
  elementsSource.includes("__frameGravityFlat = familyConfig.primaryFlat;") &&
  !elementsSource.includes("__frameGravityFlat = __buildFlatOffsets(__frameGravityOffsets, false);"),
  "family32 should reuse cached flat offsets instead of allocating typed arrays each frame"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on the new cached-table assertion.

**Step 3: Write minimal implementation**

In `scripts/elements.js`:
- extend `__getFamily32BucketConfig(bucketIdx)` to precompute:
  - `primaryFlat`
  - `inverseFlat`
  - `secondaryFlat`
  - `inverseSecondaryFlat`
- in `syncFrameGravity()`, assign the cached arrays directly for `family32`
- do not add any new full-grid pass or extra helper calls

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/run-bellamy-universe-test.js
node --check scripts/elements.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js tests/bellamyUniverse.test.js
git commit -m "fix(tilt): cache family32 move tables"
```

### Task 4: Lock Bucket 0 To Vanilla Down

**Files:**
- Modify: `scripts/game.js`
- Modify: `scripts/elements.js`
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add a regression that makes bucket `0` a strict downward baseline:

```js
assert(
  elementsSource.includes("const forwardY = stepY === 0 ? 1 : stepY;"),
  "family32 should normalize vertical-down bucket behavior"
);

assert(
  !elementsSource.includes("__pushFamily32Offset(primaryOffsets, -1, 0);"),
  "bucket 0 should not bias left in its primary move set"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL if current local behavior still allows left/right drift for the down bucket.

**Step 3: Write minimal implementation**

In `scripts/elements.js` and only if needed in `scripts/game.js`:
- ensure the straight-down bucket uses the same local 1-pixel fall neighborhood as vanilla
- keep dominant-axis sweep
- do not add phase-wide world switching

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/run-bellamy-universe-test.js
node --check scripts/elements.js
node --check scripts/game.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js scripts/game.js tests/bellamyUniverse.test.js
git commit -m "fix(tilt): align bucket zero with vanilla down"
```

### Task 5: Separate Nearby Buckets Without Global Phase Switching

**Files:**
- Modify: `scripts/elements.js`
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add a regression that preserves local-only bucket separation:

```js
assert(
  elementsSource.includes("minorShare: major === 0 ? 0 : Math.round((minor * 8) / major)") &&
  elementsSource.includes("phase < __frameGravityMinorShare"),
  "nearby tilt buckets should diverge through local bias, not global traversal mode switching"
);

assert(
  !elementsSource.includes("tilt world mode") &&
  !elementsSource.includes("schedule[phase]"),
  "tilt restart should avoid whole-world phase schedules"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL until the test is added.

**Step 3: Write minimal implementation**

In `scripts/elements.js`:
- keep bucket differences local
- if necessary, tune only the `minorShare` mapping and the major/secondary local offsets
- do not add 2-pixel jumps, radius scans, or world-wide phase switching

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/run-bellamy-universe-test.js
node --check scripts/elements.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js tests/bellamyUniverse.test.js
git commit -m "fix(tilt): separate nearby buckets with local bias"
```

### Task 6: Restore Liquid Feel Without Block Motion

**Files:**
- Modify: `scripts/elements.js`
- Modify: `tests/bellamyUniverse.test.js`
- Test: `tests/run-bellamy-universe-test.js`

**Step 1: Write the failing test**

Add a narrow liquid-specific regression:

```js
const waterActionMatch = elementsSource.match(/function WATER_ACTION\\(x, y, i\\) \\{([\\s\\S]*?)\\n\\}/);
assert(waterActionMatch, "elements.js should contain WATER_ACTION body");
assert(
  !waterActionMatch[1].includes("doLiquidFlow("),
  "restart should not reintroduce the broken block-style liquid helper unchanged"
);
```

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL once the regression is added.

**Step 3: Write minimal implementation**

Implement the smallest local liquid rule that fits the engine:
- keep `WATER_ACTION` simple
- if a liquid-specific tilt path is reintroduced, it must:
  - stay inside the same 1-pixel neighborhood
  - only target `BACKGROUND`
  - clear the old cell correctly
  - not run as a second global fallback for all elements

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/run-bellamy-universe-test.js
node --check scripts/elements.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js tests/bellamyUniverse.test.js
git commit -m "fix(tilt): restore local liquid flow"
```

### Task 7: Browser Verification Against The Known-Good Preview

**Files:**
- Modify: none unless a bug is found
- Test: browser manual verification

**Step 1: Start the local server**

Run:

```bash
python -m http.server 8000
```

**Step 2: Verify local behavior**

Open `http://127.0.0.1:8000` and check:
- Tilt toggle does not freeze
- Bucket `0` matches vanilla down
- Buckets `1` and `31` behave like mirrors
- Nearby buckets no longer collapse badly
- Water no longer moves as a rigid block

**Step 3: Compare against the known-good preview**

Open:

```text
https://skill-deploy-janhtwww84-codex-agent-deploys.vercel.app/
```

Use it as the stability/feel baseline:
- if local is worse, stop and fix before merging
- if local is clearly better or equal, continue

**Step 4: Run final checks**

Run:

```bash
node tests/run-bellamy-universe-test.js
node tests/run-menu-grouping-test.js
node tests/run-canvas-scaling-test.js
```

Expected: all PASS

**Step 5: Commit**

```bash
git add scripts/elements.js tests/bellamyUniverse.test.js
git commit -m "fix(tilt): verify stable restart behavior"
```

### Task 8: Deploy A Fresh Preview

**Files:**
- Modify: none
- Test: Vercel preview output

**Step 1: Ensure clean working tree**

Run:

```bash
git status --short
```

Expected: no tracked modifications.

**Step 2: Deploy**

Use the existing Vercel workflow/skill from this repo to create a preview deployment from `tilt-restart`.

**Step 3: Record the preview URL**

Capture:
- preview URL
- claim URL if provided

**Step 4: Smoke test**

Open the preview and verify:
- page loads
- Tilt toggle works
- no immediate freeze

**Step 5: Commit any deployment-only metadata only if the workflow requires it**

Otherwise, no code commit is needed here.
