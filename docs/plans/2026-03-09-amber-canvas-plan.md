# Project Amber Canvas Fill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the onscreen canvas span the full viewport while rebranding every visible title/metadata to “Project Amber.”

**Architecture:** Keep the simulation’s internal 640×480 buffer and JavaScript logic intact while updating the HTML/CSS shell so the `#gameWrapper`/`canvas` stretch edge-to-edge. Update the metadata and headings in `index.html` to the new name and ensure scripts that set inline styles keep syncing with the underlying width/height constants.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript; browser rendering via `<canvas>`; manual verification in a web browser.

---

### Task 1: Rebrand to Project Amber

**Files:**
- Modify: `index.html`
- Test: Manual browser check (no automated tests exist)

**Step 1: Inspect current strings.**
Scroll to the `<title>` tag, header text (e.g., `<h1 class="title">Project Sand</h1>`), and any descriptive internal links referencing “Project Sand.” Note their locations so replacements are precise.

**Step 2: Update the markup.**
Replace “Project Sand” with “Project Amber” in `<title>`, visible headings/subheader text (including the “Source Code” caption if needed), and any other descriptive copy that mentions the old project name. Keep linked URLs unchanged unless they should point to an Amber-specific resource.

**Step 3: Verify the change.**
Start a simple static server (`python -m http.server 8000`), open `http://localhost:8000`, and confirm the browser tab title and visible headings now read “Project Amber.” No automated test is available, so manually narrate this verification in the final summary.


### Task 2: Stretch the Canvas to Fill the Viewport

**Files:**
- Modify: `styles.css`
- Modify: `scripts/game.js`
- Test: Manual visual check

**Step 1: Update layout styles.**
Adjust `#gameWrapper` and `canvas` selectors so they span the full viewport width and height (e.g., `width: 100vw; height: 100vh; display: block; margin: 0 auto;`). Remove fixed width constraints on the wrapper and ensure the menu still sits below or overlays appropriately.

**Step 2: Ensure inline sizing stays in sync.**
Confirm `scripts/game.js` continues to set `onscreenCanvas.width`/`height` and style width/height based on the `width`/`height` constants after the CSS changes. If any inline styles conflict with the new CSS, adjust them so they rely on the constants (keep the actual simulation resolution at 640×480 while letting the CSS handle scaling).

**Step 3: Manual verification.**
Reload `http://localhost:8000` and ensure the canvas fills the viewport horizontally and vertically. Check that menus remain accessible and that the game still renders correctly without JavaScript errors.

**Step 4: Document verification.**
Note the manual checks performed above as part of the final response or commit message so reviewers know the new layout was exercised.
