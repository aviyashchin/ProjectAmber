# Fast Pixel Architecture Design

## Goal

Define the non-negotiable architectural rules for Project Amber so future features preserve the original fast pixel sandbox feel.

## Core Principle

The engine is fast because it is a single direct pixel simulation:

- one `Uint32Array`
- one bottom-up sweep
- local neighbor rules
- very little extra state
- very few particle-heavy or long-range behaviors

Any feature that violates those assumptions must be treated as suspicious by default.

## Hard Constraints

### 1. One Hot Path

The main simulation loop in `scripts/game.js` is the primary engine.

Rules:

- Do not add a second full-grid control plane.
- Do not add per-frame world scans for heat, pressure, sunlight, moisture, or weather fields.
- Do not add element systems that require global bookkeeping to remain correct.

### 2. Local Rules Only

Element actions in `scripts/elements.js` should depend on:

- the current pixel
- immediate neighbors
- small constant-time helpers
- probabilistic throttling where needed

Avoid:

- column scans
- radius scans
- flood fills in the hot path
- pathfinding
- iterative field relaxation

### 3. Expensive Classes Need Budgets

Some classes of elements are inherently more expensive and should be explicitly budgeted.

#### Gases

Examples: `STEAM`, `CLOUD`, `METHANE`

Rules:

- gas elements should skip many frames
- gas elements should use simple rise and spread rules
- gas-to-gas interactions should stay sparse
- gas should never depend on a global weather model

#### Force Tools

Examples: `SUN`, `CRYO`, `ANTI-G`, `BLACK_HOLE`

Rules:

- force tools are special sparse toys, not bulk-fill materials
- force tools should be stationary
- force tools should act intermittently
- force tools should only affect a tiny neighborhood

#### Particles

Examples: explosions, tree growth, magic effects

Rules:

- particles should remain rare
- particle spawning should be capped
- tree particles and magic particles should be treated as luxuries
- no feature should require particles to be common for the game to feel complete

## Safe Feature Shapes

These are good fits for the engine:

- new powders, liquids, and solids with local density rules
- local transforms like `water + fire -> steam`
- local ecology like `soil + rain -> wet soil`
- simple stateful variants like `rain` as falling water
- palette, tooltip, and tutorial improvements

## Unsafe Feature Shapes

These should usually be rejected or aggressively simplified:

- true temperature simulation
- pressure fields
- global sunlight models
- atmospheric control planes
- any feature that needs “every cell knows a scalar field”
- special elements that do more work because they are “smart”

## Performance-First Water Cycle

The water cycle should be an illusion built from local state changes:

- `WATER` near `SUN` can become `STEAM`
- `STEAM` can rise and sometimes become `CLOUD`
- `CLOUD` can drift slowly and sometimes drop `RAIN`
- `RAIN` can become `WATER` or `WET_SOIL`
- `CLOUD` can also dissipate back into `BACKGROUND` or `STEAM`

This gives a toy semblance of circulation without simulating the atmosphere.

## Toy Conservation Rule

Project Amber does not need exact conservation of mass, but it should preserve the feeling that matter mostly cycles rather than appearing from nowhere.

Practical rule:

- every water-cycle state should have both forward and backward transitions

Examples:

- `WATER -> STEAM`
- `STEAM -> CLOUD`
- `CLOUD -> RAIN`
- `RAIN -> WATER`
- `CLOUD -> STEAM`
- `STEAM -> WATER`
- `CLOUD -> BACKGROUND` only at a low rate and only as a simplification of dispersal

This keeps the world readable while avoiding heavy accounting.

## UI Rules

- Keep default palette focused on readable core materials.
- Put weird discovery toys in `Advanced` or `Discovery`.
- Do not expose the heaviest chaos elements as default spigots.
- Preserve playful discovery, but do not let discovery dominate the performance budget.

## Decision Test

Before adding a feature, ask:

1. Does it add another per-frame scan?
2. Does it do more than local neighbor work?
3. Does it make gas or particles much more common?
4. Does it require hidden state outside the main pixel buffer?

If the answer is yes, simplify it before implementation.
