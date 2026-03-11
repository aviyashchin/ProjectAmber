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
    menuSource.includes('label: "Forces"') &&
    menuSource.includes('label: "Life"') &&
    menuSource.includes('label: "Advanced"'),
    "menu.js should define the Bellamy group labels"
  );
}

module.exports = {
  testPaletteUsesBellamyGroups
};
