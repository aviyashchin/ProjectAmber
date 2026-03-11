# Tilt Gravity Benchmark Notes

## Sand-heavy scene

- Fill the upper half of the world with `SAND`.
- Compare `default`, `bucket16`, and `radius2`.
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

- `setGravityExperimentMode("default")`
- `setGravityExperimentMode("bucket16", 0)`
- `setGravityExperimentMode("bucket16", 4)`
- `setGravityExperimentMode("radius2", 0)`
- `setGravityExperimentMode("radius2", 4)`
- `setGravityBucketIndex(8)`
