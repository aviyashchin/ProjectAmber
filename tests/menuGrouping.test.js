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

function testBorderCheckboxExists() {
  const menuSource = getMenuSource();
  const indexSource = getIndexSource();

  assert(
    indexSource.includes('id="borderCheckbox"'),
    "index.html should provide a borderCheckbox control"
  );

  assert(
    menuSource.includes('const borderCheckbox = document.getElementById("borderCheckbox");') &&
    menuSource.includes('document.body.classList.toggle("borderless", !borderCheckbox.checked);'),
    "menu.js should wire the border checkbox to a borderless body class"
  );
}

module.exports = {
  testPaletteUsesBellamyGroups,
  testBorderCheckboxExists
};
