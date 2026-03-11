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
  assert(elementsSource.includes("const BLACK_HOLE = __inGameColor("), "elements.js should define BLACK_HOLE");

  assert(elementsSource.includes("function SUN_ACTION("), "elements.js should define SUN_ACTION");
  assert(elementsSource.includes("function CLOUD_ACTION("), "elements.js should define CLOUD_ACTION");
  assert(elementsSource.includes("function RAIN_ACTION("), "elements.js should define RAIN_ACTION");
  assert(elementsSource.includes("function BLACK_HOLE_ACTION("), "elements.js should define BLACK_HOLE_ACTION");
  assert(elementsSource.includes("function CRYO_ACTION("), "elements.js should define CRYO_ACTION");

  assert(menuSource.includes('menuNames[SUN] = "SUN"'), "menu.js should expose SUN in the menu");
  assert(menuSource.includes('menuNames[CRYO] = "CRYO"'), "menu.js should expose CRYO in the menu");
  assert(
    menuSource.includes('menuNames[BLACK_HOLE] = "BLACK HOLE"'),
    "menu.js should expose BLACK HOLE in the menu"
  );

  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(
    !sunActionMatch[1].includes("doRise(") && !sunActionMatch[1].includes("doDensityGas("),
    "SUN_ACTION should heat nearby cells without moving"
  );

  const cryoActionMatch = elementsSource.match(/function CRYO_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(cryoActionMatch, "elements.js should contain CRYO_ACTION body");
  assert(
    !cryoActionMatch[1].includes("doRise(") && !cryoActionMatch[1].includes("doDensityGas("),
    "CRYO_ACTION should cool nearby cells without moving"
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
    tooltipSource.includes('Rain: "Falling water from clouds."'),
    "tooltips.js should describe rain as falling water"
  );

  assert(
    tooltipSource.includes('Tree: "Woody life that grows upward"'),
    "tooltips.js should include a kid-readable Tree description"
  );

  assert(
    tooltipSource.includes('Cryo: "A tiny cold star. It freezes nearby things."'),
    "tooltips.js should include a kid-readable Cryo description"
  );

  assert(
    tooltipSource.includes('"Black Hole": "A super gravity spot that pulls nearby things in."'),
    "tooltips.js should include a kid-readable Black Hole description"
  );
}

function testPlantGrowthUsesLocalChecks() {
  const elementsSource = read("scripts/elements.js");
  const plantActionMatch = elementsSource.match(/function PLANT_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(plantActionMatch, "elements.js should contain PLANT_ACTION body");
  assert(
    !plantActionMatch[1].includes("isHeatedBySun("),
    "PLANT_ACTION should avoid full-column sunlight scans"
  );

  assert(
    plantActionMatch[1].includes("surroundedByAdjacentCount(x, y, i, PLANT)"),
    "PLANT_ACTION should short-circuit crowded plant clusters"
  );
}

function testWeatherStateAndForceFamilies() {
  const elementsSource = read("scripts/elements.js");
  const menuSource = read("scripts/menu.js");

  const rainActionMatch = elementsSource.match(/function RAIN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(rainActionMatch, "elements.js should contain RAIN_ACTION body");
  assert(
    rainActionMatch[1].includes("doGravity(x, y, i, true, 98)") &&
    rainActionMatch[1].includes("gameImagedata32[i] = WATER;"),
    "RAIN_ACTION should behave like falling water and settle back into WATER"
  );

  const cloudActionMatch = elementsSource.match(/function CLOUD_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(cloudActionMatch, "elements.js should contain CLOUD_ACTION body");
  assert(
    cloudActionMatch[1].includes("borderingAdjacentCount(x, y, i, CLOUD)") &&
    cloudActionMatch[1].includes("below(y, i, BACKGROUND)"),
    "CLOUD_ACTION should use nearby cloud clustering and space below for rain formation"
  );

  assert(
    menuSource.includes("items: [SUN, FIRE, TORCH, LAVA, CRYO]"),
    "menu.js should group SUN and CRYO together in Heat & Fire"
  );
}

module.exports = {
  testUniverseScriptsAreLoaded,
  testWeatherElementsExist,
  testTemperatureLoopExists,
  testBellamyDescriptionsExist,
  testPlantGrowthUsesLocalChecks,
  testWeatherStateAndForceFamilies
};
