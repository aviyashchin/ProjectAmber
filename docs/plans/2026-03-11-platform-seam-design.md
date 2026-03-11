# Bellamy Platform Seam Design

## Goal

Add a small web-first platform seam to the Bellamy build so gentle haptics, tilt permission, and later native device hooks can live outside the simulation loop.

## Constraints

- Preserve the fast pixel engine and hot loop.
- Keep the Bellamy build as a plain website for now.
- Do not add Capacitor tooling yet.
- Reuse the browser capabilities that already exist in the repo where practical.

## Recommended Approach

Add one lightweight browser-backed module at `scripts/platform.js` that exposes:

- `platform.haptics`
- `platform.device`

For the website build:

- `platform.haptics` uses `navigator.vibrate()` when available and otherwise no-ops safely.
- `platform.device.enableTilt()` delegates to the current `DeviceOrientationEvent` flow.
- `platform.device.lockOrientation()` and `platform.device.unlockOrientation()` are best-effort browser wrappers that fail safely.

This keeps all platform-specific APIs out of gameplay code. The simulation should only call small adapter methods, never browser device APIs directly.

## Scope For This Pass

- Add `scripts/platform.js`
- Load it from `index.html`
- Add a simple haptics toggle to the Bellamy UI
- Route gentle UI and drawing haptics through the platform adapter
- Route tilt enablement through the platform device adapter
- Expose orientation lock methods for later use, but do not build a full orientation UI yet

## Non-Goals

- No Capacitor scaffolding
- No native app packaging
- No new simulation behavior
- No haptics in the hot loop beyond light throttled draw pulses

## Verification

- String-based regression coverage for the platform seam and haptics wiring
- Bellamy regression suite still passes
- Script syntax checks still pass
