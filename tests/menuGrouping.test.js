const fs = require("fs");
const path = require("path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getMenuSource() {
  return fs.readFileSync(path.join(__dirname, "..", "scripts", "menu.js"), "utf8");
}

function getIndexSource() {
  return fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
}

function testPaletteUsesBellamyGroups() {
  const menuSource = getMenuSource();
  const indexSource = getIndexSource();

  assert(
    indexSource.includes('id="elementPalette"'),
    "index.html should provide an elementPalette container for grouped sections"
  );

  assert(
    menuSource.includes("const elementMenuGroups = ["),
    "menu.js should define grouped palette sections"
  );

  assert(
    menuSource.includes('label: "Earth"') &&
    menuSource.includes('label: "Water & Sky"') &&
    menuSource.includes('label: "Heat & Fire"') &&
    menuSource.includes('label: "Discovery"') &&
    menuSource.includes('label: "Life"') &&
    menuSource.includes('label: "Advanced"'),
    "menu.js should define the Bellamy group labels"
  );
}

function testCanvasBorderIsAlwaysRemoved() {
  const menuSource = getMenuSource();
  const indexSource = getIndexSource();
  const stylesSource = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert(
    !indexSource.includes('id="borderCheckbox"'),
    "index.html should no longer provide a borderCheckbox control"
  );

  assert(
    !menuSource.includes('const borderCheckbox = document.getElementById("borderCheckbox");') &&
    !menuSource.includes('document.body.classList.toggle("borderless", !borderCheckbox.checked);'),
    "menu.js should no longer wire a border checkbox"
  );

  assert(
    stylesSource.includes("canvas {") &&
    stylesSource.includes("border: none;") &&
    !stylesSource.includes("body.borderless canvas"),
    "styles.css should keep the canvas borderless by default"
  );
}

module.exports = {
  testPaletteUsesBellamyGroups,
  testCanvasBorderIsAlwaysRemoved
};
