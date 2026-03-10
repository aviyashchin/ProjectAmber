# Bellamy Universe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the first coherent "toy universe" layer to Project Amber by improving the UI, fixing viewport polish, and implementing a first-pass sun-driven water cycle on top of the existing sandbox.

**Architecture:** Keep the current falling-sand core intact and add lightweight world systems incrementally. Focus on shared heat, evaporation, condensation, rain, and soil moisture behaviors plus kid-readable palette and tooltip cleanup, while avoiding broad rewrites of unrelated simulation logic.

**Tech Stack:** Plain browser JavaScript, HTML canvas, existing Project Amber scripts, PowerShell, small Node-based regression tests where feasible

---

### Task 1: Document the current baseline and lock scope

**Files:**
- Modify: `docs/plans/2026-03-10-bellamy-universe-design.md`
- Modify: `docs/plans/2026-03-10-bellamy-universe-implementation-plan.md`

**Step 1: Review the current behavior**

Read:
- `scripts/canvasConfig.js`
- `scripts/game.js`
- `scripts/elements.js`
- `scripts/menu.js`
- `scripts/tooltips.js`
- `scripts/temperature.js`

Write a short "baseline assumptions" section in the design doc if anything important changed from the current understanding.

Also record the updated requirement that `SUN` should be an explicit anti-gravity heat element rather than only a hidden global heating rule.

**Step 2: Verify no code changes yet**

Run: `git diff -- docs/plans/2026-03-10-bellamy-universe-design.md docs/plans/2026-03-10-bellamy-universe-implementation-plan.md`
Expected: only documentation changes

**Step 3: Commit docs checkpoint**

```bash
git add docs/plans/2026-03-10-bellamy-universe-design.md docs/plans/2026-03-10-bellamy-universe-implementation-plan.md
git commit -m "docs(plan): add Bellamy universe design"
```

### Task 2: Fix viewport edge sizing polish

**Files:**
- Modify: `scripts/canvasConfig.js`
- Modify: `styles.css`
- Test: `tests/run-canvas-scaling-test.js`

**Step 1: Write the failing test**

Create or extend a small regression test that asserts canvas sizing uses the available layout width/height conservatively enough to avoid the slight overhang/clipping feeling reported by the user.

Suggested approach:
- Add a simple source-level assertion around sizing constants or sizing helper logic if a direct DOM test is too heavy.

**Step 2: Run test to verify it fails**

Run: `node tests/run-canvas-scaling-test.js`
Expected: FAIL for the specific edge-sizing assertion

**Step 3: Write minimal implementation**

Make the smallest change necessary to reduce the canvas by the equivalent of border/scrollbar/chrome slack without shrinking the playfield excessively.

Prefer:
- a tighter sizing calculation in `scripts/canvasConfig.js`
- or wrapper/canvas box-model adjustments in `styles.css`

Avoid:
- large layout rewrites
- changing unrelated menu structure

**Step 4: Run test to verify it passes**

Run: `node tests/run-canvas-scaling-test.js`
Expected: PASS

**Step 5: Manual verification**

Run:
```bash
python -m http.server 8000
```

Check in browser:
- canvas no longer feels clipped on left/right edges
- footer/menu still aligns with canvas
- mouse coordinates still feel correct

**Step 6: Commit**

```bash
git add scripts/canvasConfig.js styles.css tests/run-canvas-scaling-test.js
git commit -m "fix(layout): polish canvas edge sizing"
```

### Task 3: Reorganize the palette for Bellamy readability

**Files:**
- Modify: `scripts/menu.js`
- Modify: `styles.css`
- Modify: `index.html`

**Step 1: Write the failing test**

If practical, add a small menu structure assertion test under `tests/` that verifies primary categories exist or the menu renders grouped sections. If a DOM-free test is too expensive, document why and use manual verification only.

**Step 2: Run test to verify it fails**

Run the chosen test command, or if no lightweight test is practical, record that this task will rely on manual verification.

**Step 3: Write minimal implementation**

Group primary elements into visible families:
- Earth
- Water & Sky
- Heat & Fire
- Life
- Advanced

Preserve the existing menu mechanics where possible.

**Step 4: Verify**

Manual checks:
- categories are visible and readable
- Bellamy-facing first elements are easy to find
- advanced/weird elements are de-emphasized instead of removed

**Step 5: Commit**

```bash
git add scripts/menu.js styles.css index.html
git commit -m "feat(ui): group palette for Bellamy"
```

### Task 4: Clean up kid-facing labels and tooltips

**Files:**
- Modify: `scripts/menu.js`
- Modify: `scripts/tooltips.js`

**Step 1: Write the failing test**

Add a lightweight source-level test that checks for a few target labels/tooltips:
- Soil mentions holding water
- Steam mentions hot water rising
- Cloud mentions rain
- Tree mentions woody growth
- Bacteria or Microbe label is consistent

**Step 2: Run test to verify it fails**

Run the new test command
Expected: FAIL on at least one old label/tooltip

**Step 3: Write minimal implementation**

Adjust labels and descriptions to be:
- plain-language
- short
- playful but accurate

Do not rewrite the whole educational system.

**Step 4: Run test to verify it passes**

Run the new test command
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/menu.js scripts/tooltips.js tests
git commit -m "feat(ui): simplify Bellamy element descriptions"
```

### Task 5: Add a minimal sunlight and cooling loop

**Files:**
- Modify: `scripts/game.js`
- Modify: `scripts/temperature.js`
- Test: `tests/temperature.test.js` or new targeted test

**Step 1: Write the failing test**

Add a focused test for temperature behavior, for example:
- exposed water near the top gains heat over time
- cells cool toward ambient when no heat source is present

If current tests are browser-console style only, add a small Node-targeted source/helper test instead of forcing a large test harness rewrite.

**Step 2: Run test to verify it fails**

Run the chosen test command
Expected: FAIL because sunlight/cooling logic is missing or incomplete

**Step 3: Write minimal implementation**

Add a lightweight system that:
- introduces `SUN` as an explicit element with hot anti-gravity behavior
- applies global/top-down heating or local sunlight influence from `SUN`, whichever fits the tracked codebase more cleanly
- applies passive cooling
- keeps tuning conservative

Prefer making `SUN` visible and paintable if it can be done surgically.

**Step 4: Run test to verify it passes**

Run the chosen test command
Expected: PASS

**Step 5: Manual verification**

Check that:
- hot materials still feel responsive
- the world does not immediately overheat
- wet zones feel calmer/cooler over time

**Step 6: Commit**

```bash
git add scripts/game.js scripts/temperature.js tests
git commit -m "feat(sim): add sunlight and passive cooling"
```

### Task 6: Implement first-pass evaporation and condensation

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/temperature.js`
- Test: `tests/temperature.test.js` or new targeted water-cycle test

**Step 1: Write the failing test**

Add a regression test that checks the intended behavior:
- warm water can become steam
- steam in cooler conditions can condense

**Step 2: Run test to verify it fails**

Run the chosen test command
Expected: FAIL

**Step 3: Write minimal implementation**

Update water/steam behavior to use the new heat model:
- evaporation depends on temperature/exposure
- condensation depends on cooling/location

Keep the rules simple and visible.

**Step 4: Run test to verify it passes**

Run the chosen test command
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js scripts/temperature.js tests
git commit -m "feat(sim): add evaporation and condensation"
```

### Task 7: Implement cloud and rain behavior tied to the new loop

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/tooltips.js`
- Test: `tests/temperature.test.js` or new targeted weather test

**Step 1: Write the failing test**

Add a focused test for:
- cloud formation from cooled vapor or condensed droplets
- rain generation from cloud saturation/cooling

**Step 2: Run test to verify it fails**

Run the chosen test command
Expected: FAIL

**Step 3: Write minimal implementation**

Teach cloud/rain elements to:
- cluster lightly
- produce rain under simple cool/saturated conditions

Keep the behavior readable and avoid building a full atmospheric simulation.

**Step 4: Run test to verify it passes**

Run the chosen test command
Expected: PASS

**Step 5: Manual verification**

In browser:
- water under warm conditions can produce vapor
- vapor can create clouds high in the world
- clouds can rain

**Step 6: Commit**

```bash
git add scripts/elements.js scripts/tooltips.js tests
git commit -m "feat(weather): add cloud and rain loop"
```

### Task 8: Strengthen soil wetting and drying

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/tooltips.js`
- Test: new targeted soil-moisture test if needed

**Step 1: Write the failing test**

Create a test for:
- rain/water reliably creates wet soil
- wet soil dries gradually when exposed to heat/air

**Step 2: Run test to verify it fails**

Run the test command
Expected: FAIL

**Step 3: Write minimal implementation**

Adjust soil/wet soil logic so Bellamy can clearly observe:
- infiltration
- storage
- drying

Avoid deep nutrient simulation in this task.

**Step 4: Run test to verify it passes**

Run the test command
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/elements.js scripts/tooltips.js tests
git commit -m "feat(soil): improve wetting and drying loop"
```

### Task 9: Tie plant and tree growth more clearly to the water cycle

**Files:**
- Modify: `scripts/elements.js`
- Modify: `scripts/tooltips.js`
- Test: targeted biology growth test if feasible

**Step 1: Write the failing test**

Add a small test verifying:
- wet soil improves growth conditions
- dry/hot conditions slow or prevent growth

**Step 2: Run test to verify it fails**

Run the test command
Expected: FAIL

**Step 3: Write minimal implementation**

Keep existing plant/tree systems, but make their conditions more coherent with the new water loop:
- plant = faster, softer growth
- tree = slower, sturdier, more dependent on supportive ground

Do not redesign the full biology layer yet.

**Step 4: Run test to verify it passes**

Run the test command
Expected: PASS

**Step 5: Manual verification**

Check in browser:
- Bellamy can intentionally make better growing conditions
- growth feels earned, not random magic

**Step 6: Commit**

```bash
git add scripts/elements.js scripts/tooltips.js tests
git commit -m "feat(biology): tie growth to water cycle"
```

### Task 10: Add guided play prompts for the new universe loop

**Files:**
- Modify: `scripts/challenges.js`
- Modify: `scripts/tooltips.js`
- Modify: `README.md` or `TIPS.md` if appropriate

**Step 1: Write the failing test**

If there is already a challenge test harness, add a small test for new prompt metadata. Otherwise rely on manual verification and document why.

**Step 2: Run test to verify it fails**

Run chosen test if present.

**Step 3: Write minimal implementation**

Add 3-5 Bellamy-facing prompts:
- Make Rain
- Grow a Forest
- Dry Out a Swamp
- Cool a Volcano

Keep instructions short and playful.

**Step 4: Verify**

Manual checks:
- prompts are visible
- prompts lead the player toward the new systems

**Step 5: Commit**

```bash
git add scripts/challenges.js scripts/tooltips.js README.md TIPS.md
git commit -m "feat(play): add Bellamy universe prompts"
```

### Task 11: Run full verification and summarize gaps

**Files:**
- Modify: `docs/plans/2026-03-10-bellamy-universe-design.md`
- Modify: `docs/plans/2026-03-10-bellamy-universe-implementation-plan.md`

**Step 1: Run automated checks**

Run every relevant targeted test added during this work, including:

```bash
node tests/run-canvas-scaling-test.js
```

Plus any additional new Node-targeted or browser-console tests introduced during implementation.

Expected: all targeted tests pass

**Step 2: Run manual checks in browser**

Verify:
- canvas sizing feels right
- palette is easier to use
- tooltips are child-readable
- water can evaporate, condense, and rain
- soil gets wet and dries
- plants respond to improved conditions

**Step 3: Update docs with actual outcomes**

Add a short "implemented in overnight session" section documenting:
- what was completed
- what remains
- any tuning risks

**Step 4: Commit**

```bash
git add docs/plans/2026-03-10-bellamy-universe-design.md docs/plans/2026-03-10-bellamy-universe-implementation-plan.md
git commit -m "docs(plan): record Bellamy universe progress"
```
