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
    menuSource.includes('label: "Discovery"'),
    "menu.js should expose a Discovery group for weird experiments"
  );

  assert(
    menuSource.includes("items: [BLACK_HOLE, MYSTERY]"),
    "menu.js should keep the heaviest toys in a small Discovery group"
  );

  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(
    sunActionMatch[1].includes("if (random() < 76) return;") &&
    !sunActionMatch[1].includes("addTemperatureAt(") &&
    sunActionMatch[1].includes("__tryApplyHeatReaction(idx)") &&
    sunActionMatch[1].includes("gameImagedata32[idx] = SOIL;"),
    "SUN_ACTION should use compact local heating rules without a separate temperature field"
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
    methaneActionMatch[1].includes("if (random() < __tiltGasThrottleChance(55)) return;") &&
    methaneActionMatch[1].includes("__findNeighborByFlag(x, y, i, NEIGHBOR_FLAG_HOT_SOURCE, false) !== -1"),
    "METHANE_ACTION should stay sparse and let nearby hot elements ignite methane directly"
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
    menuSource.includes("items: [BLACK_HOLE, MYSTERY]"),
    "BLACK_HOLE should live in the Discovery group"
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
    sunActionMatch[1].includes("if (random() < 76) return;") &&
    antiGravityActionMatch[1].includes("if (random() < 80) return;") &&
    cryoActionMatch[1].includes("if (random() < 90) return;"),
    "force tools should skip most frames in performance-first mode"
  );

  assert(
    steamActionMatch[1].includes("__tiltGasThrottleChance(45)") &&
    cloudActionMatch[1].includes("__tiltGasThrottleChance(55)"),
    "gas elements should skip many frames in performance-first mode"
  );

  assert(
    wetSoilActionMatch[1].includes("particles.particleCounts[TREE_PARTICLE] < 6"),
    "wet soil should cap expensive tree particles aggressively"
  );
}

function testCloudsThinWhenTheyRain() {
  const elementsSource = read("scripts/elements.js");
  const cloudActionMatch = elementsSource.match(/function CLOUD_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const tooltipSource = read("scripts/tooltips.js");

  assert(cloudActionMatch, "elements.js should contain CLOUD_ACTION body");
  assert(
    cloudActionMatch[1].includes("gameImagedata32[rainLoc] = RAIN;") &&
    cloudActionMatch[1].includes("gameImagedata32[i] = BACKGROUND;"),
    "clouds should lose mass when they rain"
  );

  assert(
    tooltipSource.includes('Cloud: "Cool mist that can rain"'),
    "tooltips.js should keep cloud behavior kid-readable"
  );
}

function testTiltGravityExperimentSwitchExists() {
  const gameSource = read("scripts/game.js");
  const elementsSource = read("scripts/elements.js");
  const menuSource = read("scripts/menu.js");
  const indexSource = read("index.html");
  const stylesSource = read("styles.css");

  assert(
    gameSource.includes("var gravityExperimentMode = \"default\";") &&
    gameSource.includes("var gravityBucketCount = 16;") &&
    gameSource.includes("const gravityState = {") &&
    gameSource.includes("strategy: \"baseline\"") &&
    gameSource.includes("const TILT_BUCKET_VECTORS_32 = Object.freeze([") &&
    gameSource.includes("window.enableTiltMotionControls = enableTiltMotionControls;") &&
    gameSource.includes("function handleTiltOrientation(event) {") &&
    gameSource.includes("function mapDeviceOrientationToGravity(beta, gamma) {") &&
    gameSource.includes("window.addEventListener(\"deviceorientation\", handleTiltOrientation, true);") &&
    gameSource.includes("window.setGravityExperimentMode = function") &&
    gameSource.includes("window.setTiltBenchmarkState = function") &&
    gameSource.includes("window.setTiltGravityVector = function") &&
    gameSource.includes("window.setTiltDeviceGravity = function") &&
    gameSource.includes("function projectTiltVector("),
    "game.js should expose tilt-gravity state, browser motion hooks, and mapping helpers"
  );

  assert(
    elementsSource.includes("function getGravityMode()") &&
    elementsSource.includes("function getGravityStrength()") &&
    elementsSource.includes("return gravityExperimentMode;"),
    "elements.js should read the active gravity state from game.js"
  );

  assert(
    indexSource.includes('id="tiltModeCheckbox"') &&
    indexSource.includes('id="tiltDebugPanel"') &&
    indexSource.includes('id="tiltBucketSlider"') &&
    indexSource.includes('id="tiltStrengthSlider"') &&
    indexSource.includes('id="tiltBucketValue"') &&
    indexSource.includes('id="tiltStrengthValue"') &&
    indexSource.includes('id="tiltSceneSandButton"') &&
    indexSource.includes('id="tiltSceneMixedButton"') &&
    indexSource.includes('id="tiltSceneGasButton"') &&
    indexSource.includes('id="tiltSceneClearButton"') &&
    indexSource.includes('id="tiltDirectionDownButton"') &&
    indexSource.includes('id="tiltDirectionDownRightButton"') &&
    indexSource.includes('id="tiltDirectionRightButton"') &&
    menuSource.includes("const tiltModeCheckbox = document.getElementById(\"tiltModeCheckbox\")"),
    "the UI should expose a visible tilt debug panel"
  );

  assert(
    menuSource.includes("const tiltBucketSlider = document.getElementById(\"tiltBucketSlider\")") &&
    menuSource.includes("const tiltStrengthSlider = document.getElementById(\"tiltStrengthSlider\")") &&
    menuSource.includes("const tiltBucketValue = document.getElementById(\"tiltBucketValue\")") &&
    menuSource.includes("const tiltStrengthValue = document.getElementById(\"tiltStrengthValue\")") &&
    menuSource.includes("function shouldEnableTiltByDefault() {") &&
    menuSource.includes("function enableTiltMotionInBackground() {") &&
    menuSource.includes("function armDefaultTiltMotionEnable() {") &&
    menuSource.includes("window.projectAmberPlatform.device.enableTilt()") &&
    !menuSource.includes("await window.projectAmberPlatform.device.enableTilt()") &&
    menuSource.includes("const tiltDefaultEnabled = shouldEnableTiltByDefault();") &&
    menuSource.includes("if (tiltDefaultEnabled) {") &&
    menuSource.includes("window.setGravityExperimentMode(\"family32\", gravityBucketIndex);") &&
    menuSource.includes("armDefaultTiltMotionEnable();") &&
    menuSource.includes("document.addEventListener(\"pointerdown\", requestTiltMotionOnFirstGesture, { once: true, passive: true });") &&
    menuSource.includes("document.getElementById(\"tiltSceneSandButton\")") &&
    menuSource.includes("document.getElementById(\"tiltDirectionRightButton\")"),
    "menu.js should default tilt on only for likely mobile sensor devices and arm motion permission from the first real gesture without blocking the click handler"
  );

  assert(
    stylesSource.includes(".tiltDebugCard") &&
    stylesSource.includes(".tiltDebugControls") &&
    stylesSource.includes(".tiltDebugButtons"),
    "styles.css should define the tilt debug panel layout"
  );

  assert(
    stylesSource.includes("#fps-counter {") &&
    stylesSource.includes("top: 1px;") &&
    stylesSource.includes("right: 1px;") &&
    !stylesSource.includes("bottom: 1px;"),
    "the FPS counter should live in the top-right corner"
  );
}

function testTiltGravityCandidatesStayLocal() {
  const gameSource = read("scripts/game.js");
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("const GRAVITY_BUCKET_OFFSETS_16 =") &&
    elementsSource.includes("const GRAVITY_BUCKET_OFFSETS_32 =") &&
    elementsSource.includes("const GRAVITY_BUCKET_OFFSETS_RADIUS_2 =") &&
    elementsSource.includes("const GRAVITY_BUCKET_OFFSETS_RADIUS_2_32 ="),
    "elements.js should define 16-angle and 32-angle gravity candidate tables"
  );

  assert(
    elementsSource.includes("function syncFrameGravity()") &&
    elementsSource.includes("__frameGravityOffsets") &&
    elementsSource.includes("__getFamily32BucketConfig(bucketIdx)") &&
    !elementsSource.includes("getGravityMode() === \"scanline32\""),
    "elements.js should resolve gravity offsets once per frame via syncFrameGravity"
  );

  const gravityMatch = elementsSource.match(/function doGravity\(x, y, i, fallAdjacent, chance\) \{([\s\S]*?)\n\}/);
  assert(gravityMatch, "elements.js should contain doGravity body");
  assert(
    gravityMatch[1].includes("if (__frameGravityIsBaseline)") &&
    gravityMatch[1].includes("return doGravityBaseline(x, y, i, fallAdjacent, chance);"),
    "doGravity should jump straight to the vanilla helper when tilt is off"
  );

  assert(
    gameSource.includes("const dir = TILT_BUCKET_VECTORS_32[i];") &&
    !gameSource.includes("const dir = GRAVITY_BUCKET_OFFSETS_32[i][0];"),
    "scanline traversal should use explicit 32-angle vectors instead of reusing old local offset tables"
  );

  assert(
    !elementsSource.includes("for (dy = -2; dy <= 2; dy++)") &&
    !elementsSource.includes("for (dx = -2; dx <= 2; dx++)"),
    "tilt gravity candidates should avoid scanning full local neighborhoods"
  );

  assert(
    gameSource.includes("gravityState.strategy === \"family32\"") &&
    !gameSource.includes("gravityState.strategy === \"scanline32\""),
    "family32 should be the only real tilt traversal strategy in the main loop"
  );

  assert(
    elementsSource.includes("const GRAVITY_BUCKET_OFFSETS_FAMILY_32 =") &&
    elementsSource.includes("__getFamily32BucketConfig(bucketIdx)"),
    "family32 should use its own stronger bucket offsets so nearby buckets diverge more clearly"
  );

  assert(
    elementsSource.includes("primaryFlat: __buildFlatOffsets(primaryOffsets, false)") &&
    elementsSource.includes("inverseFlat: __buildFlatOffsets(primaryOffsets, true)") &&
    elementsSource.includes("secondaryFlat: __buildFlatOffsets(secondaryOffsets, false)") &&
    elementsSource.includes("inverseSecondaryFlat: __buildFlatOffsets(secondaryOffsets, true)"),
    "family32 bucket configs should cache flat offset tables once instead of rebuilding them each frame"
  );

  assert(
    elementsSource.includes("__frameGravityFlat = familyConfig.primaryFlat;") &&
    elementsSource.includes("__frameGravityInverseFlat = familyConfig.inverseFlat;") &&
    elementsSource.includes("__frameGravityFlatAlt = familyConfig.secondaryFlat;") &&
    elementsSource.includes("__frameGravityInverseFlatAlt = familyConfig.inverseSecondaryFlat;") &&
    !elementsSource.includes("if (mode === \"family32\") {\n      const familyConfig = __getFamily32BucketConfig(bucketIdx);\n      __frameGravityFlatAlt = __buildFlatOffsets(familyConfig.secondaryOffsets, false);"),
    "syncFrameGravity should reuse cached family32 flat tables instead of allocating them every frame"
  );

  const familyCandidatesMatch = elementsSource.match(/const GRAVITY_CANDIDATES_FAMILY_32 = \[([\s\S]*?)\n\];/);
  assert(familyCandidatesMatch, "elements.js should define the family32 gravity candidates");
  assert(
    familyCandidatesMatch[1].includes("[0, 1], [-1, 1], [1, 1], [-1, 0], [1, 0]") &&
    !familyCandidatesMatch[1].includes("[0, 2]") &&
    !familyCandidatesMatch[1].includes("[-2, 2]"),
    "family32 should stay in the local one-pixel neighborhood so straight-down tilt matches vanilla behavior"
  );

  assert(
    elementsSource.includes("for (var k = 5; k < 10; k++) {") &&
    elementsSource.includes("for (var k = 5; k < 15; k++) {") &&
    elementsSource.includes("for (var k = 5; k < 20; k++) {"),
    "family32 jitter should keep the primary gravity candidate fixed and only permute fallback moves"
  );

  assert(
    elementsSource.includes("function __getFamily32BucketConfig(bucketIdx) {") &&
    elementsSource.includes("minorShare: major === 0 ? 0 : Math.round((minor * 8) / major)") &&
    elementsSource.includes("const leadDiagX = stepX === 0 ? -1 : stepX;") &&
    elementsSource.includes("const trailDiagX = -leadDiagX;") &&
    elementsSource.includes("__pushFamily32Offset(primaryOffsets, leadDiagX, forwardY);") &&
    elementsSource.includes("__pushFamily32Offset(primaryOffsets, trailDiagX, forwardY);") &&
    elementsSource.includes("function __family32Phase(x, y) {") &&
    elementsSource.includes("if (__frameGravityMirrorX) phaseX = MAX_X_IDX - phaseX;") &&
    elementsSource.includes("if (__frameGravityMirrorY) phaseY = MAX_Y_IDX - phaseY;"),
    "family32 should keep diagonal spill options in its local bias configs and use mirrored local phase selection"
  );

  assert(
    gameSource.includes("updateGameFamily32()") &&
    !gameSource.includes("updateGameWithDescriptor(traversalFamilyDescriptors[gravityState.family]);") &&
    gameSource.includes("const bucketVector = TILT_BUCKET_VECTORS_32[gravityState.bucket];") &&
    gameSource.includes("if (absDx > absDy)") &&
    !gameSource.includes("const family = gravityState.family;"),
    "family32 should keep a fixed dominant-axis sweep instead of switching whole-world traversal phases"
  );

  assert(
    elementsSource.includes("const phase = __family32Phase(x, y);") &&
    elementsSource.includes("phase < __frameGravityMinorShare") &&
    !elementsSource.includes("candidateOffsets = GRAVITY_BUCKET_OFFSETS_FAMILY_32_JITTER[jitter][bucketIdx];"),
    "family32 should choose between major-first and diagonal-first local plans from a mirrored per-pixel phase"
  );

  assert(
    gameSource.includes("const lineJitter = (tiltRowTraversalModes[Y] + tiltTraversalPhase) & 3;") &&
    gameSource.includes("const lineJitter = (tiltColumnTraversalModes[X] + tiltTraversalPhase) & 3;") &&
    gameSource.includes("if (lineJitter === 0 || lineJitter === 3)") &&
    gameSource.includes("else if (lineJitter === 1)"),
    "family32 should vary scanline direction with a wider deterministic pattern to reduce stripes"
  );

  assert(
    gameSource.includes("const tiltRowTraversalModes = new Uint8Array(height);") &&
    gameSource.includes("const tiltColumnTraversalModes = new Uint8Array(width);") &&
    gameSource.includes("function initTiltTraversalModes()") &&
    gameSource.includes("var tiltTraversalPhase = 0;") &&
    gameSource.includes("tiltTraversalPhase = (tiltTraversalPhase + 1) & 7;") &&
    gameSource.includes("const lineJitter = (tiltRowTraversalModes[Y] + tiltTraversalPhase) & 3;") &&
    gameSource.includes("const lineJitter = (tiltColumnTraversalModes[X] + tiltTraversalPhase) & 3;"),
    "family32 should precompute tilt traversal modes instead of recomputing line patterns in the hot loop"
  );

  const fireActionMatch = elementsSource.match(/function FIRE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(fireActionMatch, "elements.js should contain FIRE_ACTION body");
  assert(
    fireActionMatch[1].includes("findTiltRiseLoc(x, y, i)") &&
    !fireActionMatch[1].includes("above(y, i, BACKGROUND)"),
    "FIRE_ACTION should respect tilt gravity when choosing its rise direction"
  );

  const torchActionMatch = elementsSource.match(/function TORCH_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  assert(torchActionMatch, "elements.js should contain TORCH_ACTION body");
  assert(
    torchActionMatch[1].includes("produceTiltFire(x, y, i, 38)") &&
    !torchActionMatch[1].includes("doProducer(x, y, i, FIRE, true, 25)"),
    "TORCH_ACTION should produce fire in the tilt-aware rise direction"
  );

  const gasDensityMatch = elementsSource.match(/function doDensityGas\(x, y, i, chance\) \{([\s\S]*?)\n\}/);
  assert(gasDensityMatch, "elements.js should contain doDensityGas body");
  assert(
    gasDensityMatch[1].includes("if (__frameGravityIsBaseline) return doDensityGasVertical(x, y, i, chance);") &&
    gasDensityMatch[1].includes("__frameGravityInverseFlat !== null") &&
    gasDensityMatch[1].includes("findTiltGasLoc(x, y, i)") &&
    !gasDensityMatch[1].includes("const aboveSpot = i - width;"),
    "doDensityGas should use tilt-aware gas motion instead of hardcoded vertical checks"
  );

  assert(
    elementsSource.includes("function doGravityBaseline(") &&
    elementsSource.includes("function doRiseBaseline(") &&
    elementsSource.includes("function doDensitySinkBaseline(") &&
    elementsSource.includes("function doDensityLiquidBaseline("),
    "baseline movement helpers should exist as separate fast paths"
  );
}

function testTiltGravityBenchmarkNotesExist() {
  const benchmarkNotes = read("tests/tiltGravityBenchmarkNotes.md");

  assert(
    benchmarkNotes.includes("Sand-heavy scene") &&
    benchmarkNotes.includes("Mixed water scene") &&
    benchmarkNotes.includes("Gas-heavy scene") &&
    benchmarkNotes.includes("Bucket boundary stability") &&
    benchmarkNotes.includes("family32") &&
    !benchmarkNotes.includes("scanline32") &&
    benchmarkNotes.includes("Tilt Debug") &&
    benchmarkNotes.includes("Bucket slider") &&
    benchmarkNotes.includes("Strength slider"),
    "tilt gravity benchmark notes should describe the family32-first comparison scenes"
  );
}

function testPlatformSeamAndHapticsExist() {
  const indexSource = read("index.html");
  const gameSource = read("scripts/game.js");
  const menuSource = read("scripts/menu.js");
  const cursorSource = read("scripts/cursor.js");
  const platformSource = read("scripts/platform.js");

  assert(
    indexSource.includes('src="scripts/platform.js"'),
    "index.html should load scripts/platform.js for browser-backed platform hooks"
  );

  assert(
    indexSource.includes('id="hapticsButton"'),
    "index.html should expose a haptics toggle in the Bellamy UI"
  );

  assert(
    platformSource.includes("window.projectAmberPlatform =") &&
    platformSource.includes("haptics: {") &&
    platformSource.includes("device: {"),
    "platform.js should define a shared platform object with haptics and device adapters"
  );

  assert(
    platformSource.includes("navigator.vibrate") &&
    platformSource.includes("function init()") &&
    platformSource.includes("function toggle()") &&
    platformSource.includes("function light()") &&
    platformSource.includes("function medium()") &&
    platformSource.includes("function heavy()") &&
    platformSource.includes("function draw()"),
    "platform.js should provide gentle browser-backed haptics helpers"
  );

  assert(
    platformSource.includes("async function enableTilt()") &&
    platformSource.includes("async function lockOrientation(mode)") &&
    platformSource.includes("function unlockOrientation()"),
    "platform.js should provide device adapter methods for tilt and orientation"
  );

  assert(
    menuSource.includes("const hapticsButton = document.getElementById(\"hapticsButton\")") &&
    menuSource.includes("window.projectAmberPlatform.haptics.toggle()") &&
    menuSource.includes("window.projectAmberPlatform.device.enableTilt()"),
    "menu.js should wire the Bellamy UI through the platform seam"
  );

  assert(
    gameSource.includes("window.projectAmberPlatform.device.enableTilt = enableTiltMotionControls;") &&
    gameSource.includes("window.projectAmberPlatform.device.lockOrientation = lockGameOrientation;") &&
    gameSource.includes("window.projectAmberPlatform.haptics.init();"),
    "game.js should connect the runtime tilt/orientation hooks and initialize haptics"
  );

  assert(
    cursorSource.includes("window.projectAmberPlatform.haptics.draw()"),
    "cursor.js should trigger gentle draw haptics through the platform seam"
  );
}

function testDensityTablesExist() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("const STATE_CLASS_EMPTY = 0;") &&
    elementsSource.includes("const STATE_CLASS_POWDER = 2;") &&
    elementsSource.includes("const STATE_CLASS_LIQUID = 3;") &&
    elementsSource.includes("const STATE_CLASS_GAS = 4;"),
    "elements.js should define small integer state classes for the fast pixel engine"
  );

  assert(
    elementsSource.includes("const ELEMENT_STATE_CLASS = new Uint8Array(64);") &&
    elementsSource.includes("const ELEMENT_DENSITY = new Uint8Array(64);") &&
    elementsSource.includes("function __setElementPhysics(elem, stateClass, density) {"),
    "elements.js should store state and density as compact lookup tables keyed by element index"
  );

  assert(
    elementsSource.includes("__setElementPhysics(WATER, STATE_CLASS_LIQUID, 3);") &&
    elementsSource.includes("__setElementPhysics(SALT_WATER, STATE_CLASS_LIQUID, 4);") &&
    elementsSource.includes("__setElementPhysics(OIL, STATE_CLASS_LIQUID, 2);") &&
    elementsSource.includes("__setElementPhysics(SAND, STATE_CLASS_POWDER, 5);") &&
    elementsSource.includes("__setElementPhysics(ROCK, STATE_CLASS_POWDER, 6);") &&
    elementsSource.includes("__setElementPhysics(STEAM, STATE_CLASS_GAS, 1);"),
    "elements.js should assign simple density ranks to key materials"
  );
}

function testGenericDensityHelpersExist() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("function doDensitySinkByClass(x, y, i, sinkAdjacent, chance) {") &&
    elementsSource.includes("function doDensityLiquidByClass(x, y, i, sinkChance, equalizeChance) {"),
    "elements.js should expose generic density helpers for powders and liquids"
  );

  const sandActionMatch = elementsSource.match(/function SAND_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const waterActionMatch = elementsSource.match(/function WATER_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const saltWaterActionMatch = elementsSource.match(/function SALT_WATER_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const oilActionMatch = elementsSource.match(/function OIL_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(sandActionMatch, "elements.js should contain SAND_ACTION body");
  assert(waterActionMatch, "elements.js should contain WATER_ACTION body");
  assert(saltWaterActionMatch, "elements.js should contain SALT_WATER_ACTION body");
  assert(oilActionMatch, "elements.js should contain OIL_ACTION body");

  assert(
    sandActionMatch[1].includes("doDensitySinkByClass(x, y, i, true, 25)") &&
    !sandActionMatch[1].includes("doDensitySink(x, y, i, WATER, true, 25)") &&
    !sandActionMatch[1].includes("doDensitySink(x, y, i, SALT_WATER, true, 25)"),
    "SAND_ACTION should use the generic density helper instead of explicit water pair rules"
  );

  assert(
    waterActionMatch[1].includes("doDensityLiquidByClass(x, y, i, 25, 50)") &&
    saltWaterActionMatch[1].includes("doDensityLiquidByClass(x, y, i, 50, 50)") &&
    oilActionMatch[1].includes("doDensityLiquidByClass(x, y, i, 25, 35)"),
    "liquid actions should use the generic density helper for density-based layering"
  );
}

function testTiltDensityHelpersUseGravityPrimitives() {
  const elementsSource = read("scripts/elements.js");
  const sinkByClassMatch = elementsSource.match(/function doDensitySinkByClass\(x, y, i, sinkAdjacent, chance\) \{([\s\S]*?)\n\}/);
  const liquidByClassMatch = elementsSource.match(/function doDensityLiquidByClass\(x, y, i, sinkChance, equalizeChance\) \{([\s\S]*?)\n\}/);

  assert(
    elementsSource.includes("function __findDensityFlatMove("),
    "elements.js should define a gravity-relative density move helper for tilt"
  );

  assert(sinkByClassMatch, "elements.js should contain doDensitySinkByClass body");
  assert(liquidByClassMatch, "elements.js should contain doDensityLiquidByClass body");

  assert(
    sinkByClassMatch[1].includes("__findDensityFlatMove("),
    "doDensitySinkByClass should use gravity-relative tilt candidates instead of fixed screen-down checks"
  );

  assert(
    liquidByClassMatch[1].includes("__findDensityFlatMove("),
    "doDensityLiquidByClass should use gravity-relative tilt candidates instead of fixed screen-down checks"
  );
}

function testTiltSettledSkipExists() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("var TILT_SETTLED_SKIP = null;") &&
    elementsSource.includes("function __consumeTiltSettledSkip(i) {") &&
    elementsSource.includes("function __markTiltSettledSkip(i) {") &&
    elementsSource.includes("function __clearTiltSettledSkip(i) {") &&
    elementsSource.includes("TILT_SETTLED_SKIP = new Uint8Array(MAX_IDX + 1);"),
    "elements.js should lazily allocate the tilt-only settled-skip buffer after game dimensions exist"
  );

  const sandActionMatch = elementsSource.match(/function SAND_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const waterActionMatch = elementsSource.match(/function WATER_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(sandActionMatch, "elements.js should contain SAND_ACTION body");
  assert(waterActionMatch, "elements.js should contain WATER_ACTION body");

  assert(
    sandActionMatch[1].includes("__consumeTiltSettledSkip(i)") &&
    sandActionMatch[1].includes("__markTiltSettledSkip(i);"),
    "SAND_ACTION should skip a few tilt frames when locally settled"
  );

  assert(
    waterActionMatch[1].includes("__consumeTiltSettledSkip(i)") &&
    waterActionMatch[1].includes("__markTiltSettledSkip(i);"),
    "WATER_ACTION should skip a few tilt frames when locally settled"
  );
}

function testTiltGasThrottleExists() {
  const elementsSource = read("scripts/elements.js");
  const steamActionMatch = elementsSource.match(/function STEAM_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const cloudActionMatch = elementsSource.match(/function CLOUD_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const methaneActionMatch = elementsSource.match(/function METHANE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(
    elementsSource.includes("function __tiltGasThrottleChance(baseChance) {"),
    "elements.js should define a tiny tilt-only gas throttle helper"
  );

  assert(
    elementsSource.includes("return Math.min(95, baseChance + 8);"),
    "tilt gas throttling should stay lighter so gas still crashes through under tilt"
  );

  assert(steamActionMatch, "elements.js should contain STEAM_ACTION body");
  assert(cloudActionMatch, "elements.js should contain CLOUD_ACTION body");
  assert(methaneActionMatch, "elements.js should contain METHANE_ACTION body");

  assert(
    steamActionMatch[1].includes("__tiltGasThrottleChance(45)") &&
    cloudActionMatch[1].includes("__tiltGasThrottleChance(55)") &&
    methaneActionMatch[1].includes("__tiltGasThrottleChance(55)"),
    "hot gas actions should use the shared tilt gas throttle helper"
  );
}

function testHotLoopUsesElementIndexLookup() {
  const gameSource = read("scripts/game.js");

  assert(
    gameSource.includes("const ELEMENT_ACTION_INDEX = new Uint8Array(0x40000);") &&
    gameSource.includes("function initElementActionIndex() {") &&
    gameSource.includes("ELEMENT_ACTION_INDEX[elements[idx] & 0x30303] = idx;"),
    "game.js should precompute a compact element-action lookup for the hot loop"
  );

  assert(
    gameSource.includes("const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];"),
    "game.js should use the masked compact lookup key instead of indexing by the full 32-bit color"
  );
}

function testLocalReactionLookupTablesExist() {
  const elementsSource = read("scripts/elements.js");
  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const cryoActionMatch = elementsSource.match(/function CRYO_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(
    elementsSource.includes("const ELEMENT_NEIGHBOR_FLAGS = new Uint8Array(64);") &&
    elementsSource.includes("const ELEMENT_HEAT_RESULT = new Uint32Array(64);") &&
    elementsSource.includes("const ELEMENT_HEAT_CHANCE = new Uint8Array(64);") &&
    elementsSource.includes("const ELEMENT_COLD_RESULT = new Uint32Array(64);") &&
    elementsSource.includes("const ELEMENT_COLD_CHANCE = new Uint8Array(64);"),
    "elements.js should precompute compact local reaction lookup tables"
  );

  assert(
    elementsSource.includes("const NEIGHBOR_FLAG_HOT_SOURCE = 1;") &&
    elementsSource.includes("const NEIGHBOR_FLAG_COOLANT = 2;") &&
    elementsSource.includes("const NEIGHBOR_FLAG_WATER = 4;") &&
    elementsSource.includes("const NEIGHBOR_FLAG_FLAME_KEEPER = 8;"),
    "elements.js should define compact neighbor flags for hot local queries"
  );

  assert(
    elementsSource.includes("ELEMENT_HEAT_RESULT[__elementIndex(WATER)] = STEAM;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(WATER)] = 20;") &&
    elementsSource.includes("ELEMENT_HEAT_RESULT[__elementIndex(ICE)] = WATER;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(ICE)] = 18;") &&
    elementsSource.includes("ELEMENT_COLD_RESULT[__elementIndex(WATER)] = ICE;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(WATER)] = 14;") &&
    elementsSource.includes("ELEMENT_COLD_RESULT[__elementIndex(ICE)] = CHILLED_ICE;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(ICE)] = 10;"),
    "elements.js should encode slightly stronger Sun/Cryo reactions in compact lookup tables"
  );

  assert(
    elementsSource.includes("function __findNeighborByFlag(") &&
    elementsSource.includes("function __tryApplyHeatReaction(idx) {") &&
    elementsSource.includes("function __tryApplyColdReaction(idx) {"),
    "elements.js should use local table-driven helpers for heat and cold reactions"
  );

  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(cryoActionMatch, "elements.js should contain CRYO_ACTION body");

  assert(
    sunActionMatch[1].includes("__tryApplyHeatReaction(idx)") &&
    !sunActionMatch[1].includes("elem === WATER || elem === RAIN"),
    "SUN_ACTION should use the compact heat lookup table instead of a long element chain"
  );

  assert(
    cryoActionMatch[1].includes("__tryApplyColdReaction(idx)") &&
    !cryoActionMatch[1].includes("borderingElem === WATER || borderingElem === RAIN"),
    "CRYO_ACTION should use the compact cold lookup table instead of a long element chain"
  );
}

function testHotAndColdActionsAreSlightlyStronger() {
  const elementsSource = read("scripts/elements.js");
  const iceActionMatch = elementsSource.match(/function ICE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const chilledIceActionMatch = elementsSource.match(/function CHILLED_ICE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const torchActionMatch = elementsSource.match(/function TORCH_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const fireActionMatch = elementsSource.match(/function FIRE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const sunActionMatch = elementsSource.match(/function SUN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const cryoActionMatch = elementsSource.match(/function CRYO_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(iceActionMatch, "elements.js should contain ICE_ACTION body");
  assert(chilledIceActionMatch, "elements.js should contain CHILLED_ICE_ACTION body");
  assert(torchActionMatch, "elements.js should contain TORCH_ACTION body");
  assert(fireActionMatch, "elements.js should contain FIRE_ACTION body");
  assert(sunActionMatch, "elements.js should contain SUN_ACTION body");
  assert(cryoActionMatch, "elements.js should contain CRYO_ACTION body");

  assert(
    torchActionMatch[1].includes("produceTiltFire(x, y, i, 38);"),
    "TORCH_ACTION should emit a hotter flame stream"
  );

  assert(
    fireActionMatch[1].includes("if (random() < 28)") &&
    fireActionMatch[1].includes("if (random() < 90)") &&
    fireActionMatch[1].includes("if (random() < 62)"),
    "FIRE_ACTION should be tuned slightly hotter without changing its local shape"
  );

  assert(
    sunActionMatch[1].includes("if (random() < 76) return;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(WATER)] = 20;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(RAIN)] = 20;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(CLOUD)] = 12;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(ICE)] = 18;") &&
    elementsSource.includes("ELEMENT_HEAT_CHANCE[__elementIndex(CHILLED_ICE)] = 24;"),
    "SUN should be rebalanced upward with stronger local heat reactions"
  );

  assert(
    cryoActionMatch[1].includes("if (random() < 90) return;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(WATER)] = 14;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(RAIN)] = 14;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(STEAM)] = 12;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(CLOUD)] = 8;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(ICE)] = 10;") &&
    elementsSource.includes("ELEMENT_COLD_CHANCE[__elementIndex(LAVA)] = 16;"),
    "CRYO should stay distinct, but softer so heat and cold feel more balanced"
  );

  assert(
    iceActionMatch[1].includes("bordering(x, y, i, TORCH) !== -1") &&
    iceActionMatch[1].includes("bordering(x, y, i, SUN) !== -1") &&
    chilledIceActionMatch[1].includes("bordering(x, y, i, TORCH) !== -1") &&
    chilledIceActionMatch[1].includes("bordering(x, y, i, SUN) !== -1"),
    "ice should react directly to nearby torch and sun heat without a separate temperature field"
  );
}

function testSettledSkipCoversCommonTiltMovers() {
  const elementsSource = read("scripts/elements.js");
  const saltActionMatch = elementsSource.match(/function SALT_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const rainActionMatch = elementsSource.match(/function RAIN_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const soilActionMatch = elementsSource.match(/function SOIL_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(
    elementsSource.includes("const ELEMENT_TILT_SETTLE = new Uint8Array(64);") &&
    elementsSource.includes("function __shouldUseTiltSettledSkip(elem) {"),
    "elements.js should define a compact tilt settled-skip lookup"
  );

  assert(
    elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(SAND)] = 1;") &&
    elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(SALT)] = 1;") &&
    elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(WATER)] = 1;") &&
    elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(SALT_WATER)] = 1;") &&
    elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(OIL)] = 1;") &&
    !elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(RAIN)] = 1;") &&
    !elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(SOIL)] = 1;") &&
    !elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(WET_SOIL)] = 1;") &&
    !elementsSource.includes("ELEMENT_TILT_SETTLE[__elementIndex(ACID)] = 1;"),
    "tilt settled-skip should stay limited to the highest-volume stable movers"
  );

  assert(saltActionMatch, "elements.js should contain SALT_ACTION body");
  assert(rainActionMatch, "elements.js should contain RAIN_ACTION body");
  assert(soilActionMatch, "elements.js should contain SOIL_ACTION body");

  assert(
    saltActionMatch[1].includes("__consumeTiltSettledSkip(i)") &&
    saltActionMatch[1].includes("__markTiltSettledSkip(i);") &&
    !rainActionMatch[1].includes("__consumeTiltSettledSkip(i)") &&
    !rainActionMatch[1].includes("__markTiltSettledSkip(i);") &&
    !soilActionMatch[1].includes("__consumeTiltSettledSkip(i)") &&
    !soilActionMatch[1].includes("__markTiltSettledSkip(i);"),
    "tilt settled-skip should avoid reactive transitional movers like rain and soil"
  );
}

function testNeighborFlagLookupsReduceRepeatedQueries() {
  const elementsSource = read("scripts/elements.js");
  const fireActionMatch = elementsSource.match(/function FIRE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const methaneActionMatch = elementsSource.match(/function METHANE_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);
  const waterActionMatch = elementsSource.match(/function WATER_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(fireActionMatch, "elements.js should contain FIRE_ACTION body");
  assert(methaneActionMatch, "elements.js should contain METHANE_ACTION body");
  assert(waterActionMatch, "elements.js should contain WATER_ACTION body");

  assert(
    fireActionMatch[1].includes("__findNeighborByFlag(x, y, i, NEIGHBOR_FLAG_COOLANT, false)") &&
    fireActionMatch[1].includes("flags & NEIGHBOR_FLAG_FLAME_KEEPER"),
    "FIRE_ACTION should use local flag lookups instead of repeated neighbor equality checks"
  );

  assert(
    methaneActionMatch[1].includes("__findNeighborByFlag(x, y, i, NEIGHBOR_FLAG_HOT_SOURCE, false) !== -1") &&
    !methaneActionMatch[1].includes("bordering(x, y, i, FIRE) !== -1"),
    "METHANE_ACTION should use the local hot-source flag lookup instead of three separate neighbor scans"
  );

  assert(
    waterActionMatch[1].includes("bordering(x, y, i, SUN) !== -1") &&
    !waterActionMatch[1].includes("__findNeighborByFlag("),
    "WATER_ACTION should keep its simple local Sun check instead of adding a new generic neighbor scan"
  );
}

function testGasPassesThroughDifferentGasLocally() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("function __canGasPassInto(gasElem, targetElem) {") &&
    elementsSource.includes("if (targetElem === gasElem) return false;") &&
    elementsSource.includes("if (targetElem === STEAM || targetElem === CLOUD || targetElem === METHANE) return true;"),
    "elements.js should define a local gas-pass helper for different gas types"
  );

  assert(
    elementsSource.includes("if (__canGasPassInto(gasElem, gameImagedata32[nextI])) return nextI;") &&
    elementsSource.includes("if (__canGasPassInto(gasElem, aboveElem)) swapSpot = aboveSpot;"),
    "gas movement helpers should use the local gas-pass helper instead of the older narrower gas check"
  );
}

function testParticlesStayOnCanvasAndAvoidReadback() {
  const particlesSource = read("scripts/particles.js");
  const gameSource = read("scripts/game.js");

  assert(
    particlesSource.includes('const offscreenParticleCtx = offscreenParticleCanvas.getContext("2d", {') &&
    particlesSource.includes("alpha: true"),
    "particles.js should keep particles on a transparent offscreen canvas"
  );

  assert(
    particlesSource.includes("offscreenParticleCtx.clearRect(0, 0, canvasWidth, canvasHeight);") &&
    !particlesSource.includes("offscreenParticleCtx.getImageData("),
    "updateParticles should clear and reuse the offscreen particle canvas without readback"
  );

  assert(
    gameSource.includes("onscreenCtx.drawImage(offscreenParticleCanvas, 0, 0, width, height);"),
    "draw should composite the particle canvas directly onto the onscreen canvas"
  );
}

function testHudNodesAreCached() {
  const menuSource = read("scripts/menu.js");

  assert(
    menuSource.includes("const fpsCounter = document.getElementById(\"fps-counter\")") &&
    menuSource.includes("const zombieCountLabel = document.getElementById(\"zombieCount\")"),
    "menu.js should cache HUD nodes instead of looking them up on every update"
  );

  assert(
    menuSource.includes("fpsCounter.innerText = \"FPS: \" + fps;") &&
    menuSource.includes("zombieCountLabel.innerText = val;") &&
    !menuSource.includes("document.getElementById(\"fps-counter\").innerText") &&
    !menuSource.includes("document.getElementById(\"zombieCount\").innerText"),
    "HUD drawing helpers should reuse cached DOM nodes"
  );
}

function testPerfCounterAvoidsShift() {
  const gameSource = read("scripts/game.js");

  assert(
    gameSource.includes("var refreshTimesStart = 0;") &&
    !gameSource.includes("refreshTimes.shift()"),
    "game.js should avoid shift()-based FPS bookkeeping"
  );

  assert(
    gameSource.includes("while (refreshTimesStart < refreshTimes.length && refreshTimes[refreshTimesStart] <= oneSecondAgo)") &&
    gameSource.includes("drawFPSLabel(refreshTimes.length - refreshTimesStart);"),
    "perfRecordFrame should use a rolling start index for FPS counting"
  );
}

function testElementMetadataUsesCompactLookup() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("const ELEMENT_META_INDEX = new Uint8Array(0x40000);") &&
    elementsSource.includes("ELEMENT_META_INDEX[elements[i] & 0x30303] = i;"),
    "elements.js should precompute a compact metadata index lookup for hot element property reads"
  );

  assert(
    elementsSource.includes("return ELEMENT_TILT_SETTLE[ELEMENT_META_INDEX[elem & 0x30303]] !== 0;") &&
    elementsSource.includes("const idx = ELEMENT_META_INDEX[elem & 0x30303];"),
    "hot metadata helpers should use the compact metadata lookup instead of recomputing __elementIndex(elem)"
  );
}

function testHotLoopFastPathsExist() {
  const gameSource = read("scripts/game.js");

  assert(
    gameSource.includes("if (elem === SAND) SAND_ACTION(") &&
    gameSource.includes("else if (elem === WATER) WATER_ACTION(") &&
    gameSource.includes("else if (elem === SALT_WATER) SALT_WATER_ACTION("),
    "game.js should fast-path the most common movers before falling back to generic action dispatch"
  );

  assert(
    !gameSource.includes("((elem & 0x30000) >>> 12) + ((elem & 0x300) >>> 6) + (elem & 0x3);"),
    "game.js should stop manually recomputing element indices inside tilt update loops"
  );
}

function testPureHorizontalTiltKeepsGasHorizontal() {
  const elementsSource = read("scripts/elements.js");

  assert(
    elementsSource.includes("var __frameGravityVectorX = 0;") &&
    elementsSource.includes("var __frameGravityVectorY = 1;"),
    "elements.js should cache the active gravity vector components for tilt-sensitive helpers"
  );

  assert(
    elementsSource.includes("if (!__frameGravityIsBaseline && gravityExperimentMode === \"family32\" && __frameGravityVectorY === 0)") &&
    elementsSource.includes("return false;"),
    "gas rise should not inject an upward component when the active tilt bucket is purely horizontal"
  );
}

function testTiltActiveBandsExist() {
  const gameSource = read("scripts/game.js");
  const cursorSource = read("scripts/cursor.js");
  const spigotsSource = read("scripts/spigots.js");

  assert(
    gameSource.includes("var activeRowMin = 0;") &&
    gameSource.includes("var activeRowMax = MAX_Y_IDX;") &&
    gameSource.includes("var activeColMin = 0;") &&
    gameSource.includes("var activeColMax = MAX_X_IDX;") &&
    gameSource.includes("function resetActiveBands() {") &&
    gameSource.includes("function beginActiveBands() {") &&
    gameSource.includes("function noteActiveBand(x, y) {") &&
    gameSource.includes("function finishActiveBands() {"),
    "game.js should define a rolling active-band tracker for tilt sweeps"
  );

  assert(
    gameSource.includes("const rowStart = Math.max(0, activeRowMin);") &&
    gameSource.includes("const rowStop = Math.min(MAX_Y_IDX, activeRowMax);") &&
    gameSource.includes("const colStart = Math.max(0, activeColMin);") &&
    gameSource.includes("const colStop = Math.min(MAX_X_IDX, activeColMax);"),
    "family32 should clip row/column sweeps to the active tilt band"
  );

  assert(
    gameSource.includes("noteActiveBand(X, y);") &&
    gameSource.includes("noteActiveBand(x, Y);"),
    "tilt sweeps should record the next active band while scanning"
  );

  assert(
    cursorSource.includes("if (typeof resetActiveBands === \"function\") resetActiveBands();") &&
    spigotsSource.includes("if (typeof resetActiveBands === \"function\") resetActiveBands();"),
    "user strokes and spigots should reopen the active tilt band when they inject new pixels"
  );

  assert(
    gameSource.includes("if (elem === WALL) {\n          i--;\n          continue;\n        }\n        noteActiveBand(x, Y);") &&
    gameSource.includes("if (elem === WALL) {\n          i++;\n          continue;\n        }\n        noteActiveBand(x, Y);") &&
    gameSource.includes("if (elem !== WALL) {\n            noteActiveBand(X, y);"),
    "active bands should ignore WALL so static boundaries do not keep the tilt sweep artificially wide"
  );

  assert(
    gameSource.includes("function clearTiltBorderWalls() {") &&
    gameSource.includes("if (gravityState.strategy === \"family32\") clearTiltBorderWalls();"),
    "tilt mode should clear any outer wall rim so material is not trapped behind the old border"
  );
}

function testTiltGravityCanExitOpenEdges() {
  const elementsSource = read("scripts/elements.js");
  const gravityMatch = elementsSource.match(/function doGravity\(x, y, i, fallAdjacent, chance\) \{([\s\S]*?)\n\}/);

  assert(gravityMatch, "elements.js should contain doGravity body");
  assert(
    elementsSource.includes("function __shouldExitTiltWorld(x, y) {") &&
    gravityMatch[1].includes("if (__shouldExitTiltWorld(x, y)) {") &&
    gravityMatch[1].includes("gameImagedata32[i] = BACKGROUND;"),
    "tilt gravity should let movers exit the world through an open boundary instead of treating the canvas edge as a solid wall"
  );
}

function testTreeParticlesPersistIntoWorld() {
  const particlesSource = read("scripts/particles.js");
  const treeActionMatch = particlesSource.match(/function TREE_PARTICLE_ACTION\(particle\) \{([\s\S]*?)\n\}/);

  assert(treeActionMatch, "particles.js should contain TREE_PARTICLE_ACTION body");
  assert(
    particlesSource.includes("function __stampTreeParticle(") &&
    treeActionMatch[1].includes("__stampTreeParticle(") &&
    treeActionMatch[1].includes("particle.color === LEAF ? LEAF : BRANCH"),
    "TREE_PARTICLE_ACTION should stamp persistent branch and leaf pixels into the main world buffer"
  );
}

function testWetSoilUsesGravityRelativeTreeSupport() {
  const elementsSource = read("scripts/elements.js");
  const wetSoilActionMatch = elementsSource.match(/function WET_SOIL_ACTION\(x, y, i\) \{([\s\S]*?)\n\}/);

  assert(wetSoilActionMatch, "elements.js should contain WET_SOIL_ACTION body");
  assert(
    elementsSource.includes("function __hasTreeSupport(x, y, i) {") &&
    elementsSource.includes("function __hasTreeGrowthSpace(x, y, i) {") &&
    wetSoilActionMatch[1].includes("__hasTreeSupport(x, y, i)") &&
    wetSoilActionMatch[1].includes("__hasTreeGrowthSpace(x, y, i)") &&
    !wetSoilActionMatch[1].includes("belowAdjacent(x, y, i, SOIL)") &&
    !wetSoilActionMatch[1].includes("belowAdjacent(x, y, i, WALL)") &&
    !wetSoilActionMatch[1].includes("aboveAdjacent(x, y, i, BACKGROUND)"),
    "WET_SOIL_ACTION should use gravity-relative support and growth-space checks when spawning tree particles"
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
  testForceAndGrowthSystemsAreThrottled,
  testCloudsThinWhenTheyRain,
  testTiltGravityExperimentSwitchExists,
  testTiltGravityCandidatesStayLocal,
  testTiltGravityBenchmarkNotesExist,
  testPlatformSeamAndHapticsExist,
  testDensityTablesExist,
  testGenericDensityHelpersExist,
  testTiltDensityHelpersUseGravityPrimitives,
  testTiltSettledSkipExists,
  testTiltGasThrottleExists,
  testHotLoopUsesElementIndexLookup,
  testLocalReactionLookupTablesExist,
  testHotAndColdActionsAreSlightlyStronger,
  testSettledSkipCoversCommonTiltMovers,
  testNeighborFlagLookupsReduceRepeatedQueries,
  testGasPassesThroughDifferentGasLocally,
  testParticlesStayOnCanvasAndAvoidReadback,
  testHudNodesAreCached,
  testPerfCounterAvoidsShift,
  testElementMetadataUsesCompactLookup,
  testHotLoopFastPathsExist,
  testPureHorizontalTiltKeepsGasHorizontal,
  testTiltActiveBandsExist,
  testTiltGravityCanExitOpenEdges,
  testTreeParticlesPersistIntoWorld,
  testWetSoilUsesGravityRelativeTreeSupport
};
