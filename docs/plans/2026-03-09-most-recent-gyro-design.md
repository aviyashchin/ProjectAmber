## Purpose
Enable the simulation to treat “down” as the real-time gravity vector reported by the device gyroscope while keeping the existing pointer/touch controls for drawing the sand. This keeps the classic 640×480 simulation intact while letting mobile users tilt their iPads to steer particles.

## Approaches
- **DeviceOrientation vector feed:** Read each frame’s `event.beta`/`event.gamma` from `DeviceOrientationEvent`, convert to a normalized gravity vector, and bias the pixel-update loop to move elements along that vector before falling straight down. This is responsive but requires allowing the browser to share motion sensors (HTTPS + explicit permission).
- **Accelerometer fallback:** Listen for `DeviceMotionEvent` acceleration including gravity, normalize it, and use it when `DeviceOrientationEvent` is absent. This covers platforms that expose acceleration but not orientation, though it may need filtering to avoid jitter.
- **Threshold-based mode (rejected):** Instead of a full vector, switch gravity direction only when tilt angles cross thresholds. Smoother, but less immersive. We prefer the constant vector for continuous feel as requested.

## Implementation Notes
- Add a `gravityVector` module (maybe under `scripts/util.js`) that keeps the latest normalized gravity direction from the gyroscope/accelerometer listeners and exposes `[dx, dy]`.
- Modify `scripts/game.js`’s update loop to bias motion toward `gravityVector` before applying the default downward push, effectively rotating the sand flow. Keep the existing `updateGame` boundary checks intact.
- Keep `scripts/canvasConfig.js` unchanged except for any new toggles; no new build tooling is needed.
- Ensure devices without sensors gracefully fall back to the original straight-down gravity by default and keep mouse/touch drawing unchanged.
- Add a small control in the menu (e.g., a checkbox “Enable tilt gravity”) so users can opt in/out if permissions are denied.

## Validation
- Test on a desktop browser (emulated sensors) plus an actual iPad (https over localhost or staging) to verify the sand follows tilt in real-time and the menu still works.
- Record the manual testing steps and any permission prompts in the change summary.
