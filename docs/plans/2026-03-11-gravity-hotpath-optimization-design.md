# Gravity Hot-Path Optimization + Benchmark Harness

## Date: 2026-03-11

## Problem

The gravity/tilt system performs per-pixel work that is constant within a frame:
- `doExperimentalGravity()` calls `getGravityMode()` up to 6 times per pixel (string comparisons)
- `doGravity()` redundantly re-checks mode after `doExperimentalGravity()` already checked it
- `scaleGravityChance()` calls `getGravityMode()` + string compare per pixel for baseline (common case returns unchanged)
- `getGravityStrength()` does `typeof` guards on a const that's always defined
- No automated way to measure FPS impact of changes

## Design

### Part A: Hoist per-pixel gravity decisions to once-per-frame

New per-frame globals resolved at the start of `updateGame()` / `updateGameFamily32()`:
- `activeGravityOffsets` — the resolved offset array for the current bucket, or `null` for baseline
- `activeGravityChanceScale` — strength multiplier (1.0 for baseline)

New `syncFrameGravity()` function does the mode/bucket/strength resolution once.

`doGravity()` simplifies to: if `activeGravityOffsets !== null`, call `__findExperimentalMove`; else baseline path. No mode string checks.

`scaleGravityChance()` becomes `return chance * activeGravityChanceScale` — a single multiply.

### Part B: Playwright benchmark harness

`tests/run-gravity-benchmark.js` — standalone Node script using Playwright.

For each gravity regime (baseline, family32 at several buckets/strengths):
1. Load benchmark scene via `page.evaluate()`
2. Set gravity state via `setTiltBenchmarkState()`
3. Wait for settling, sample FPS from `#fps-counter` over ~5s
4. Print comparison table to stdout

## Preserved invariants

- All element behavior unchanged
- Baseline scan order unchanged
- Console benchmark API (`setTiltBenchmarkState`, `getTiltBenchmarkState`, `loadBenchmarkScene`) unchanged
- `[dx, dy]` source offset tables remain readable

## Constraint

Gravity direction is constant within a frame. This was already an implicit invariant of the scan-order design.
