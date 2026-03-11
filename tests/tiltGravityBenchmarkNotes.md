# Tilt Gravity Benchmark Notes

## Tilt Debug

- Use the visible `Tilt Debug` card instead of the console when possible.
- Turn `Tilt` on, use the `Bucket slider`, and adjust the `Strength slider`.
- Use the scene buttons to fill the full canvas consistently before comparing behavior.

## Sand-heavy scene

- Fill the upper half of the world with `SAND`.
- Compare `baseline` and `family32`.
- Watch settling speed, diagonal slumping, and FPS.

## Mixed water scene

- Build a layered world with `SAND`, `WATER`, and some `SOIL`.
- Compare how liquids and falling solids respond to each gravity mode.
- Watch for unnatural sticking or jitter.

## Gas-heavy scene

- Fill a large area with `STEAM`, `CLOUD`, or `METHANE`.
- Compare whether tilt gravity hurts FPS or creates visible wobble.
- Treat this as the stress scene, not the ideal gameplay scene.

## Bucket boundary stability

- Switch between neighboring bucket indices such as `0`, `1`, and `2`.
- Watch whether falling direction changes smoothly enough.
- Look for flicker, jitter, or sudden reversals.

## Manual console hooks

- `setTiltBenchmarkState({ strategy: "baseline", bucket: 0, strength: 1 })`
- `setTiltBenchmarkState({ strategy: "family32", bucket: 8, strength: 1 })`
- `setTiltBenchmarkState({ strategy: "family32", bucket: 12, strength: 1 })`
- `setTiltBenchmarkState({ strategy: "family32", bucket: 8, strength: 0.1 })`
- `setTiltGravityVector(0, 1)` for straight-down gravity
- `setTiltGravityVector(1, 0)` for rightward gravity
- `setTiltDeviceGravity(0, 0, 1)` for a flat device that should feel almost still
- `setTiltDeviceGravity(0.7, 0.7, 0)` for a strongly tilted device
