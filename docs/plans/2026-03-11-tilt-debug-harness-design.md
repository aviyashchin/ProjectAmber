# Tilt Debug Harness Design

## Goal

Make Project Amber tilt behavior testable without the browser console by adding a small in-game debug panel and a repeatable browser automation flow.

## Why

The current tilt experiments are hard to compare reliably because they depend on console commands and ad hoc scene setup. That makes it difficult to distinguish real simulation issues from inconsistent manual testing.

We want a test surface that works for both:

- human playtesting across the full canvas
- automated browser-driven comparisons

## Recommendation

Build a compact `Tilt Debug` panel in the existing menu and wire it to the current runtime hooks.

Keep the panel explicitly debug-focused:

- tilt on or off
- bucket control
- strength control
- preset direction buttons
- preset scene buttons

Then drive that panel with Playwright in a headed browser so the same scenes, buckets, and screenshots can be reproduced without the console.

## Architecture

The simulation architecture should stay unchanged:

- the fast pixel loop remains the core
- `family32` remains the only live tilt strategy
- all bucket and strength math still lives outside the hot loop

The new work is only:

- UI controls in the menu
- tiny glue code from UI controls to existing tilt hooks
- a browser automation script or command recipe that clicks those controls

No new simulation plane, no extra grid pass, and no new heavy debug overlay.

## UI Design

Add a small `Tilt Debug` card near the current controls.

Contents:

- `Tilt` checkbox
- `Bucket` slider from `0` to `31`
- `Strength` slider from `0.00` to `1.00`
- readouts for current bucket and current strength
- direction preset buttons:
  - `Down`
  - `Down-Right`
  - `Right`
  - `Up-Right`
- scene preset buttons:
  - `Sand`
  - `Mixed`
  - `Gas`
  - `Clear`

The panel should reuse current runtime hooks where possible:

- `setGravityExperimentMode(...)`
- `setTiltBenchmarkState(...)`
- `setTiltGravityVector(...)`
- `loadBenchmarkScene(...)`

## Automation Design

Use Playwright CLI in a headed browser to:

1. open the local page
2. toggle tilt on
3. load a preset scene
4. set bucket and strength through real UI controls
5. wait a short settle period
6. capture FPS text and screenshots

This does not require adding Playwright as a checked-in dependency. The debug panel is the stable automation target.

## Testing Strategy

Keep the existing string-based regression tests and extend them to cover:

- the tilt debug UI exists
- the bucket and strength controls are present
- the debug panel is wired to the known tilt hooks
- the benchmark notes reference the visible UI flow instead of the console-first flow

Manual verification should use the full canvas:

- compare `bucket 2` vs `bucket 4`
- compare low vs high strength
- compare `Tilt` off vs `Tilt` on under a large sand fill

## Non-Goals

- no real mobile sensor event wiring yet
- no haptics yet
- no new visualization overlay for vector fields
- no attempt to make every bucket perfectly distinct before the harness exists

## Success Criteria

This work is successful if:

1. tilt can be controlled from the UI without the console
2. I can drive the same controls via Playwright
3. full-canvas testing becomes repeatable
4. the simulation hot path does not gain new debug overhead when controls are idle
