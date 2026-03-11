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
    menuSource.includes("window.projectAmberPlatform.device.enableTilt()") &&
    !menuSource.includes("await window.projectAmberPlatform.device.enableTilt()") &&
    menuSource.includes("const tiltDefaultEnabled = shouldEnableTiltByDefault();") &&
    menuSource.includes("if (tiltDefaultEnabled) {") &&
    menuSource.includes("window.setGravityExperimentMode(\"family32\", gravityBucketIndex);") &&
    menuSource.includes("if (shouldEnableTiltByDefault()) enableTiltMotionInBackground();") &&
    menuSource.includes("document.getElementById(\"tiltSceneSandButton\")") &&
    menuSource.includes("document.getElementById(\"tiltDirectionRightButton\")"),
    "menu.js should default tilt on only for likely mobile sensor devices and only enable live motion on those devices without blocking the click handler"
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
    torchActionMatch[1].includes("produceTiltFire(x, y, i, 25)") &&
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
  testPlatformSeamAndHapticsExist
};
