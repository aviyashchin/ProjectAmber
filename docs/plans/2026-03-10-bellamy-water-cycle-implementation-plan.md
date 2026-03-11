# Bellamy Water Cycle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore a few playful UI affordances, document the fast-pixel constraints, and build a local-rule water cycle slice that feels educational without slowing the engine down.

**Architecture:** Preserve the existing `Uint32Array` pixel engine and add only local neighbor-based water-cycle rules. Use UI structure and docs to support discovery, while keeping expensive toys hidden or throttled by default.

**Tech Stack:** Plain HTML, CSS, browser JavaScript, existing Project Amber pixel engine, top-level `tests/` regression scripts.

---

### Task 1: Add first-principles docs to the branch

**Files:**
- Create: `docs/plans/2026-03-10-fast-pixel-architecture-design.md`
- Create: `docs/plans/2026-03-10-bellamy-water-cycle-learning-design.md`
- Create: `docs/plans/2026-03-10-bellamy-water-cycle-implementation-plan.md`

**Step 1: Verify docs exist**

Run: `Get-ChildItem docs/plans`
Expected: the three Bellamy water-cycle docs are listed

**Step 2: Commit**

```bash
git add docs/plans/2026-03-10-fast-pixel-architecture-design.md docs/plans/2026-03-10-bellamy-water-cycle-learning-design.md docs/plans/2026-03-10-bellamy-water-cycle-implementation-plan.md
git commit -m "docs: add Bellamy water cycle architecture"
```

### Task 2: Restore the border checkbox

**Files:**
- Modify: `index.html`
- Modify: `scripts/menu.js`
- Modify: `styles.css`
- Test: `tests/menuGrouping.test.js`

**Step 1: Write the failing test**

Add assertions that:

- `index.html` includes a border checkbox control
- `scripts/menu.js` wires it to a simple UI toggle

**Step 2: Run test to verify it fails**

Run: `node tests/run-menu-grouping-test.js`
Expected: FAIL mentioning the missing border checkbox

**Step 3: Write minimal implementation**

Implement:

- a `borderCheckbox` input in the options area
- a tiny menu handler that toggles a CSS class or body class
- no simulation logic attached to the checkbox

**Step 4: Run tests to verify they pass**

Run: `node tests/run-menu-grouping-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add index.html scripts/menu.js styles.css tests/menuGrouping.test.js
git commit -m "feat(ui): restore border checkbox"
```

### Task 3: Reintroduce a discovery section without restoring heavy defaults

**Files:**
- Modify: `scripts/menu.js`
- Modify: `scripts/spigots.js`
- Modify: `scripts/tooltips.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that:

- the palette has a `Discovery` or `Advanced` lane for weird toys
- `BLACK_HOLE` and `MYSTERY` are discoverable there
- they are not default spigot options

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on the new discovery expectations

**Step 3: Write minimal implementation**

Implement:

- a discovery grouping in `menu.js`
- tooltip copy that frames those elements as “weird experiments”
- keep them out of default spigots

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/menu.js scripts/spigots.js scripts/tooltips.js tests/bellamyUniverse.test.js
git commit -m "feat(ui): restore discovery lane"
```

### Task 4: Make the local water cycle feel more circular

**Files:**
- Modify: `scripts/elements.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that:

- `CLOUD_ACTION` includes a cheap dissipation path
- `STEAM_ACTION` can still become `CLOUD`
- `RAIN_ACTION` still becomes `WATER`
- `SUN_ACTION` can warm `CLOUD` back toward `STEAM`

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on one or more cloud-cycle assertions

**Step 3: Write minimal implementation**

Implement only local transitions:

- `STEAM -> CLOUD` at a low sparse rate
- `CLOUD -> RAIN` at a low sparse rate
- `CLOUD -> STEAM` near `SUN`
- `CLOUD -> BACKGROUND` at a very low rate to simulate dispersal
- preserve throttling and avoid any new control plane

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js tests/bellamyUniverse.test.js
git commit -m "feat(weather): tighten local water cycle"
```

### Task 5: Refresh Bellamy’s learning prompts to match the new model

**Files:**
- Modify: `scripts/tooltips.js`
- Test: `tests/bellamyUniverse.test.js`

**Step 1: Write the failing test**

Add assertions that world ideas mention:

- making rain
- drying or warming clouds
- growing life from wet soil

**Step 2: Run test to verify it fails**

Run: `node tests/run-bellamy-universe-test.js`
Expected: FAIL on world-idea copy

**Step 3: Write minimal implementation**

Update the prompts so they reflect:

- local-rule experimentation
- the toy conservation loop
- discovery toys as optional experiments

**Step 4: Run tests to verify they pass**

Run: `node tests/run-bellamy-universe-test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/tooltips.js tests/bellamyUniverse.test.js
git commit -m "docs(ui): refresh Bellamy learning prompts"
```

### Task 6: Final verification

**Files:**
- Modify: none unless a verification failure requires a surgical fix

**Step 1: Run focused verification**

Run:

```bash
node tests/run-bellamy-universe-test.js
node tests/run-menu-grouping-test.js
node tests/run-canvas-scaling-test.js
node --check scripts/elements.js
node --check scripts/menu.js
node --check scripts/spigots.js
node --check scripts/tooltips.js
```

Expected:

- all regression scripts PASS
- all `node --check` commands exit successfully

**Step 2: Manual smoke test**

Serve the worktree and verify:

- border checkbox toggles visual framing only
- discovery items are visible but not dominant
- water can become steam
- steam can become cloud
- cloud can rain
- rain can wet soil

**Step 3: Commit any final fix if needed**

```bash
git add <relevant files>
git commit -m "fix: address final Bellamy water cycle polish"
```
