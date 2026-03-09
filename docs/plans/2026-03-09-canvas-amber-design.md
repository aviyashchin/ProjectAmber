## Purpose
Align the UI with the new “Project Amber” name while letting the canvas stretch the full viewport width and height, matching the “just a bit more up and down” request.

## Key Adjustments
- Keep the existing canvas resolution logic (640×480) for the internal simulation loop but update the onscreen container so it spans the browser width, and increase wrapper height so the canvas visually fills the viewport vertically.
- Update the root metadata and visible headings from “Project Sand” to “Project Amber,” including the `<title>`, site header, and descriptive links.

## Implementation Notes
- `index.html`: adjust `<title>` text, heading content, and any supporting copy that explicitly names the project; wrap the canvas in a flex container if needed so it expands horizontally/vertically with the viewport while preserving the 720×480 logical resolution.
- `styles.css`: remove fixed wrapper width, allow `#gameWrapper` to fill available space, and make `canvas` styles stretch via `width: 100vw; height: 100vh; display: block;`.
- Any scripts that rely on the old “Project Sand” string for display or analytics should also reflect “Project Amber.”
- Confirm that the canvas’s physical size stays in sync with the updated CSS by ensuring inline styles applied in `scripts/game.js` continue to set width/height based on `width`/`height` variables.

## Validation
- Open the page locally after editing and verify the canvas spans the viewport width and the title shows “Project Amber.”
