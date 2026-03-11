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
    indexSource.includes('src="scripts/tooltips.js"'),
    "index.html should load scripts/tooltips.js"
  );

  assert(
    !indexSource.includes('src="scripts/temperature.js"'),
    "index.html should not load scripts/temperature.js in fast local sandbox mode"
  );
}

function testWeatherElementsExist() {
  const elementsSource = read("scripts/elements.js");
  const menuSource = read("scripts/menu.js");

  assert(elementsSource.includes("const SUN = __inGameColor("), "elements.js should define SUN");
  assert(elementsSource.includes("const ANTI_GRAVITY = __inGameColor("), "elements.js should define ANTI_GRAVITY");
  assert(elementsSource.includes("const CLOUD = __inGameColor("), "elements.js should define CLOUD");
  assert(elementsSource.includes("const RAIN = __inGameColor("), "elements.js should define RAIN");
  assert(elementsSource.includes("const BLACK_HOLE = __inGameColor("), "elements.js should define BLACK_HOLE");

  assert(elementsSource.includes("function SUN_ACTION("), "elements.js should define SUN_ACTION");
  assert(elementsSource.includes("function ANTI_GRAVITY_ACTION("), "elements.js should define ANTI_GRAVITY_ACTION");
  assert(elementsSource.includes("function CLOUD_ACTION("), "elements.js should define CLOUD_ACTION");
  assert(elementsSource.includes("function RAIN_ACTION("), "elements.js should define RAIN_ACTION");
  assert(elementsSource.includes("function BLACK_HOLE_ACTION("), "elements.js should define BLACK_HOLE_ACTION");
  assert(elementsSource.includes("function CRYO_ACTION("), "elements.js should define CRYO_ACTION");

  assert(menuSource.includes('menuNames[SUN] = "SUN"'), "menu.js should expose SUN in the menu");
  assert(
    menuSource.includes('menuNames[ANTI_GRAVITY] = "ANTI-G"'),
    "menu.js should expose ANTI-G in the menu"
  );
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

  const antiGravityActionMatch = elementsSource.match(/function ANTI_GRAVITY_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(antiGravityActionMatch, "elements.js should contain ANTI_GRAVITY_ACTION body");
  assert(
    !antiGravityActionMatch[1].includes("doGravity("),
    "ANTI_GRAVITY_ACTION should stay in place and affect neighbors instead of falling"
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

  assert(
    !gameSource.includes("initTemperature"),
    "game.js should not initialize a separate temperature system in fast local sandbox mode"
  );

  assert(
    !gameSource.includes("applyTemperaturePhysics"),
    "game.js should not run a separate temperature system each frame in fast local sandbox mode"
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
    !plantActionMatch[1].includes("isHeatedBySun(") &&
    !plantActionMatch[1].includes("getTemperatureAt("),
    "PLANT_ACTION should avoid extra sunlight or temperature scans"
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
    !cloudActionMatch[1].includes("borderingAdjacentCount(") &&
    !cloudActionMatch[1].includes("nearbyClouds >= 4"),
    "CLOUD_ACTION should avoid extra clustering logic in fast local sandbox mode"
  );

  assert(
    menuSource.includes("items: [SUN, ANTI_GRAVITY, FIRE, TORCH, LAVA, CRYO]"),
    "menu.js should group the force family in Heat & Fire"
  );

  assert(
    !menuSource.includes("label: \"Forces\""),
    "menu.js should avoid a separate default Forces group in performance-first mode"
  );

  assert(
    !menuSource.includes("items: [BLACK_HOLE]") &&
    !menuSource.includes("MYSTERY, METHANE"),
    "menu.js should keep the heaviest toys out of the default palette layout"
  );

  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(
    sunActionMatch[1].includes("if (random() < 80) return;") &&
    !sunActionMatch[1].includes("addTemperatureAt(") &&
    sunActionMatch[1].includes("elem === PLANT") &&
    sunActionMatch[1].includes("elem === OIL") &&
    sunActionMatch[1].includes("elem === METHANE") &&
    sunActionMatch[1].includes("gameImagedata32[idx] = FIRE;"),
    "SUN_ACTION should use direct local heating rules without a separate temperature field"
  );
}

function testColorFamiliesStayCoherent() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("const WATER = __inGameColor(28, 116, 255);") &&
    elementsSource.includes("const RAIN = __inGameColor(88, 182, 255);") &&
    elementsSource.includes("const CLOUD = __inGameColor(188, 222, 252);") &&
    elementsSource.includes("const ICE = __inGameColor(144, 230, 255);"),
    "water family colors should share a readable blue spectrum"
  );

  assert(
    elementsSource.includes("const TORCH = __inGameColor(255, 184, 88);") &&
    elementsSource.includes("const FIRE = __inGameColor(255, 88, 32);") &&
    elementsSource.includes("const SUN = __inGameColor(255, 226, 96);") &&
    elementsSource.includes("const LAVA = __inGameColor(255, 124, 52);"),
    "heat family colors should share a readable warm spectrum"
  );
}

function testNoTemperatureControlPlaneRemains() {
  const elementsSource = read("scripts/elements.js");

  assert(
    !elementsSource.includes("getTemperatureAt(") &&
    !elementsSource.includes("addTemperatureAt(") &&
    !elementsSource.includes("sunExposureField"),
    "elements.js should not depend on a separate temperature control plane"
  );
}

function testMethaneStaysLocalAndCheap() {
  const elementsSource = read("scripts/elements.js");
  const methaneActionMatch = elementsSource.match(/function METHANE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(methaneActionMatch, "elements.js should contain METHANE_ACTION body");
  assert(
    methaneActionMatch[1].includes("if (random() < 55) return;") &&
    methaneActionMatch[1].includes("bordering(x, y, i, SUN) !== -1"),
    "METHANE_ACTION should stay sparse and let SUN ignite methane directly"
  );

  assert(
    !methaneActionMatch[1].includes("particles.addActiveParticle"),
    "METHANE_ACTION should avoid particle-based ignition for performance"
  );
}

function testBlackHoleStaysLocal() {
  const elementsSource = read("scripts/elements.js");
  const menuSource = read("scripts/menu.js");
  const blackHoleActionMatch = elementsSource.match(/function BLACK_HOLE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(blackHoleActionMatch, "elements.js should contain BLACK_HOLE_ACTION body");
  assert(
    blackHoleActionMatch[1].includes("if (random() < 92) return;") &&
    !blackHoleActionMatch[1].includes("pullRadius") &&
    !blackHoleActionMatch[1].includes("for (dy =") &&
    !blackHoleActionMatch[1].includes("for (dx ="),
    "BLACK_HOLE_ACTION should avoid radius scans in fast local sandbox mode"
  );

  assert(
    menuSource.includes("BLACK_HOLE, METHANE, ACID, THERMITE") &&
    !menuSource.includes("label: \"Forces\""),
    "BLACK_HOLE should stay hidden in Advanced instead of its own default group"
  );
}

function testForceAndGrowthSystemsAreThrottled() {
  const elementsSource = read("scripts/elements.js");
  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const antiGravityActionMatch = elementsSource.match(/function ANTI_GRAVITY_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const cryoActionMatch = elementsSource.match(/function CRYO_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const steamActionMatch = elementsSource.match(/function STEAM_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const cloudActionMatch = elementsSource.match(/function CLOUD_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const wetSoilActionMatch = elementsSource.match(/function WET_SOIL_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(
    sunActionMatch[1].includes("if (random() < 80) return;") &&
    antiGravityActionMatch[1].includes("if (random() < 80) return;") &&
    cryoActionMatch[1].includes("if (random() < 80) return;"),
    "force tools should skip most frames in performance-first mode"
  );

  assert(
    steamActionMatch[1].includes("if (random() < 45) return;") &&
    cloudActionMatch[1].includes("if (random() < 55) return;"),
    "gas elements should skip many frames in performance-first mode"
  );

  assert(
    wetSoilActionMatch[1].includes("particles.particleCounts[TREE_PARTICLE] < 6"),
    "wet soil should cap expensive tree particles aggressively"
  );
}

module.exports = {
  testUniverseScriptsAreLoaded,
  testWeatherElementsExist,
  testTemperatureLoopExists,
  testBellamyDescriptionsExist,
  testPlantGrowthUsesLocalChecks,
  testWeatherStateAndForceFamilies,
  testColorFamiliesStayCoherent,
  testNoTemperatureControlPlaneRemains,
  testMethaneStaysLocalAndCheap,
  testBlackHoleStaysLocal,
  testForceAndGrowthSystemsAreThrottled
};
