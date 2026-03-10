const fs = require("fs");
const path = require("path");

function read(filePath) {
  return fs.readFileSync(path.join(__dirname, "..", filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testUniverseScriptsAreLoaded() {
  const indexSource = read("index.html");

  assert(
    indexSource.includes('src="scripts/temperature.js"'),
    "index.html should load scripts/temperature.js"
  );

  assert(
    indexSource.includes('src="scripts/tooltips.js"'),
    "index.html should load scripts/tooltips.js"
  );
}

function testWeatherElementsExist() {
  const elementsSource = read("scripts/elements.js");
  const menuSource = read("scripts/menu.js");

  assert(elementsSource.includes("const SUN = __inGameColor("), "elements.js should define SUN");
  assert(elementsSource.includes("const CLOUD = __inGameColor("), "elements.js should define CLOUD");
  assert(elementsSource.includes("const RAIN = __inGameColor("), "elements.js should define RAIN");

  assert(elementsSource.includes("function SUN_ACTION("), "elements.js should define SUN_ACTION");
  assert(elementsSource.includes("function CLOUD_ACTION("), "elements.js should define CLOUD_ACTION");
  assert(elementsSource.includes("function RAIN_ACTION("), "elements.js should define RAIN_ACTION");

  assert(menuSource.includes('menuNames[SUN] = "SUN"'), "menu.js should expose SUN in the menu");

  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(
    !sunActionMatch[1].includes("doRise(") && !sunActionMatch[1].includes("doDensityGas("),
    "SUN_ACTION should heat nearby cells without moving"
  );
}

function testTemperatureLoopExists() {
  const gameSource = read("scripts/game.js");
  const temperatureSource = read("scripts/temperature.js");

  assert(
    temperatureSource.includes("function initTemperature()"),
    "temperature.js should initialize the temperature system"
  );

  assert(
    temperatureSource.includes("function applyTemperaturePhysics()"),
    "temperature.js should define applyTemperaturePhysics()"
  );

  assert(
    gameSource.includes("if (typeof initTemperature === \"function\") initTemperature();"),
    "game.js should initialize the temperature system"
  );

  assert(
    gameSource.includes("if (typeof applyTemperaturePhysics === \"function\") applyTemperaturePhysics();"),
    "game.js should run the temperature system each frame"
  );
}

function testBellamyDescriptionsExist() {
  const tooltipSource = read("scripts/tooltips.js");

  assert(
    tooltipSource.includes('Soil: "Holds water for plants"'),
    "tooltips.js should include a kid-readable Soil description"
  );

  assert(
    tooltipSource.includes('Steam: "Hot water that rises"'),
    "tooltips.js should include a kid-readable Steam description"
  );

  assert(
    tooltipSource.includes('Cloud: "Cool mist that can rain"'),
    "tooltips.js should include a kid-readable Cloud description"
  );

  assert(
    tooltipSource.includes('Tree: "Woody life that grows upward"'),
    "tooltips.js should include a kid-readable Tree description"
  );
}

module.exports = {
  testUniverseScriptsAreLoaded,
  testWeatherElementsExist,
  testTemperatureLoopExists,
  testBellamyDescriptionsExist
};
