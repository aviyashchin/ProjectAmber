# Tilt Gravity Design

## Goal

Explore how to support device-driven gravity in Project Amber while preserving the fast pixel engine.

## Problem

Project Amber is built around:

- one flat pixel buffer
- one directional sweep
- local neighbor checks
- cheap element actions

Tilt gravity is appealing on phones and tablets, but naive continuous vector gravity would push the engine away from those strengths.

The goal is not physically perfect tilt.

The goal is:

- believable directional falling
- responsive feel on mobile
- minimal hot-path cost

## Recommendation

Start with `bucketed local bias`, then compare it against one richer local stencil variant.

Recommended experiment order:

1. `16-bucket local bias`
2. `radius-2 local stencil buckets`
3. optional `32-bucket` extension only if the first two are both fast enough

Do not start with continuous vector gravity.

## Approach 1: Bucketed Local Bias

### Summary

Quantize device orientation into a small number of gravity modes, such as 8 or 16.

Each mode defines:

- a primary fall direction
- two fallback directions
- a matching sweep order

### Example

If gravity is “down-right,” sand might try:

1. `(1, 1)`
2. `(0, 1)`
3. `(1, 0)`

Liquids and gases can use similar rotated preferences.

### Pros

- best fit for the current engine
- very cheap
- easy to benchmark
- easy to reason about

### Cons

- motion can feel snapped
- some in-between angles will look similar

## Approach 2: Radius-2 Local Stencil Buckets

### Summary

Still quantize orientation, but define each bucket using a richer local move stencil from a radius-2 neighborhood.

Important detail:

the engine should not scan the whole neighborhood.

Instead, each bucket uses a short ordered list of a few preferred offsets chosen from that larger radius.

### Example

For a “mostly down-right” bucket, a solid might try:

1. `(1, 2)`
2. `(1, 1)`
3. `(0, 2)`
4. `(2, 1)`

That gives smoother directional feel without doing a 25-cell search.

### Pros

- smoother than simple 8-neighbor motion
- still local
- can represent many more directional biases

### Cons

- more tuning
- harder to keep stable
- more complicated helper logic

## Approach 3: Continuous Vector Gravity

### Summary

Use accelerometer or gyroscope values directly and compute gravity from a continuous vector.

### Why Not Recommended

The engine still moves on a square pixel grid, so continuous input has to be approximated back into local discrete steps anyway.

That means most of the complexity buys limited visible benefit.

It also creates harder problems:

- sweep bias
- jitter
- angle flicker
- awkward liquid equalization

## Key Insight

The important quantity is not “how many directions exist in theory.”

The important quantity is:

- how many candidate offsets each pixel actually checks

That means:

- it is fine to have many gravity buckets
- it is not fine to do large neighborhood searches in the hot path

Good design:

- many possible buckets
- very few actual probes per pixel

## Sweep Strategy

Gravity direction and sweep order should stay aligned.

Examples:

- gravity down: sweep bottom-up
- gravity left: sweep left-to-right
- gravity right: sweep right-to-left
- gravity up: sweep top-down

For diagonal buckets, use the nearest matching dominant axis and zigzag secondary bias.

This will not be perfect, but it will be stable and cheap.

## Mobile Input Strategy

Use device orientation only to choose a gravity bucket.

Rules:

- smooth raw input over time
- use hysteresis so buckets do not flicker at boundaries
- update gravity mode less frequently than the render rate if needed

This keeps orientation handling out of the hot path.

## Benchmark Questions

Each candidate should be compared on:

1. FPS under large sand scenes
2. FPS under mixed water and sand scenes
3. FPS under gas-heavy scenes
4. subjective feel while tilting
5. stability near bucket boundaries

## Success Criteria

The feature is successful if:

1. Tilt clearly changes the dominant fall direction.
2. The engine still feels like Project Sand, not a physics simulator.
3. Large scenes remain responsive.
4. The winning implementation adds only small local-rule complexity.

## Recommendation Summary

Build the experiment around two real candidates:

- `16-bucket local bias`
- `radius-2 local stencil buckets`

Use a benchmark harness and test scenes to compare them.

Only consider more buckets after those two are understood.
