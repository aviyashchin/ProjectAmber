# Tilt Gravity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compare two fast-pixel-compatible tilt gravity approaches and identify which one best preserves performance and feel.

**Architecture:** Keep the existing pixel engine intact and add experimental gravity helpers behind a runtime switch. Quantize orientation into buckets outside the hot path, then route local movement through precomputed directional preferences.

**Tech Stack:** Plain browser JavaScript, existing Project Amber engine, top-level regression scripts, lightweight benchmark scenes.

---

### Task 1: Add experiment design references

**Files:**
- Create: `docs/plans/2026-03-10-tilt-gravity-design.md`
- Create: `docs/plans/2026-03-10-tilt-gravity-implementation-plan.md`

**Step 1: Verify docs exist**

Run: `Get-ChildItem docs/plans`
Expected: both tilt-gravity docs are listed

**Step 2: Commit**

```bash
git add docs/plans/2026-03-10-tilt-gravity-design.md docs/plans/2026-03-10-tilt-gravity-implementation-plan.md
git commit -m "docs: add tilt gravity experiment plan"
```

### Task 2: Add a minimal experiment switch

**Files:**
- Modify: `scripts/game.js`
- Modify: `scripts/menu.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that:

- the code exposes a gravity experiment mode
- the default mode remains the existing downward gravity behavior

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on missing experiment switch

**Step 3: Write minimal implementation**

Implement:

- a small global gravity mode value
- no behavior changes yet
- optional hidden debug selector or constant

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/game.js scripts/menu.js tests/bellamyUniverse.test.js
git commit -m "chore: add gravity experiment switch"
```

### Task 3: Implement candidate A, 16-bucket local bias

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/game.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that:

- candidate A uses quantized buckets
- the helper only checks a small constant number of offsets
- no radius scan is introduced

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on missing local-bias helper

**Step 3: Write minimal implementation**

Implement:

- bucket lookup tables
- rotated local gravity helper for solids/liquids
- default downward mode unchanged when experiments are off

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js scripts/game.js tests/bellamyUniverse.test.js
git commit -m "feat(sim): add tilt gravity candidate A"
```

### Task 4: Implement candidate B, radius-2 stencil buckets

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/game.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that:

- candidate B uses a precomputed offset list
- candidate B does not scan a full 25-cell neighborhood
- candidate B remains behind the experiment switch

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on missing candidate B

**Step 3: Write minimal implementation**

Implement:

- a second lookup-table candidate
- small ordered offset lists per bucket
- no extra global pass

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js scripts/game.js tests/bellamyUniverse.test.js
git commit -m "feat(sim): add tilt gravity candidate B"
```

### Task 5: Add benchmark scenes and measurement notes

**Files:**
- Create: `tests/tiltGravityBenchmarkNotes.md`
- Modify: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that benchmark notes document:

- sand-heavy scene
- mixed water scene
- gas-heavy scene
- tilt-boundary stability check

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on missing benchmark notes

**Step 3: Write minimal implementation**

Document exact benchmark scenes and what to compare.

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/tiltGravityBenchmarkNotes.md tests/bellamyUniverse.test.js
git commit -m "docs: add tilt gravity benchmark notes"
```

### Task 6: Measure and choose a winner

**Files:**
- Modify: `docs/plans/2026-03-10-tilt-gravity-design.md`
- Modify: `tests/tiltGravityBenchmarkNotes.md`

**Step 1: Run the benchmark scenes manually**

Compare:

- candidate A
- candidate B
- default gravity

Measure:

- FPS
- jitter
- visual clarity
- responsiveness

**Step 2: Document the decision**

Record:

- winner
- tradeoffs
- whether to keep 16 buckets, move to 8, or explore 32 later

**Step 3: Commit**

```bash
git add docs/plans/2026-03-10-tilt-gravity-design.md tests/tiltGravityBenchmarkNotes.md
git commit -m "docs: record tilt gravity benchmark outcome"
```
