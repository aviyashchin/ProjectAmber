/*
 * Drives the primary game loops.
 *
 * Copyright (C) 2020, Josh Don
 *
 * Project Sand is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Project Sand is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* ================================ Globals ================================ */

/* Scaling due to device pixel ratio */
const onscreenPixelRatio = window.devicePixelRatio;
const onscreenScaledWidth = onscreenPixelRatio * width;
const onscreenScaledHeight = onscreenPixelRatio * height;

/* Onscreen canvas. Scaled based on pixel ratio. */
const onscreenCanvas = document.getElementById("mainCanvas");
onscreenCanvas.width = onscreenScaledWidth;
onscreenCanvas.height = onscreenScaledHeight;
onscreenCanvas.style.width = width + "px";
onscreenCanvas.style.height = height + "px";
const onscreenCtx = onscreenCanvas.getContext("2d", { alpha: false });

/*
 * Offscreen game canvas. Drawn at in-game resolution, then
 * scaled and transferred to the onscreen canvas.
 */
const gameCanvas = document.createElement("canvas");
gameCanvas.width = width;
gameCanvas.height = height;
const gameCtx = gameCanvas.getContext("2d");
const gameImagedata = gameCtx.createImageData(width, height);
const gameImagedata32 = new Uint32Array(gameImagedata.data.buffer);

/* Storage for game save state. */
const saveGameImagedata32 = new Uint32Array(gameImagedata32.length);
var gamestateSaved = false;

/* Cached for performance */
const MAX_X_IDX = width - 1;
const MAX_Y_IDX = height - 1;
const MAX_IDX = width * height - 1;

/* Globals for tracking and maintaining FPS */
var fpsSetting; /* controlled via menu */
var msPerFrame;
var lastLoop = 0;
var frameDebt = 0;
var lastFPSLabelUpdate = 0;
const refreshTimes = [];
var refreshTimesStart = 0;
const ELEMENT_ACTION_INDEX = new Uint8Array(0x40000);
var gravityExperimentMode = "family32";
var gravityBucketCount = 16;
var gravityBucketIndex = 0;
var gravityStrength = 1;
var tiltTraversalPhase = 0;
var tiltMotionListenerAttached = false;
var tiltMotionPermissionState = "unknown";
var tiltMotionVectorX = 0;
var tiltMotionVectorY = 0;
var tiltMotionVectorZ = 1;
const gravityState = {
  strategy: "family32",
  bucket: 0,
  family: 0,
  strength: 1
};
const TILT_BUCKET_VECTORS_32 = Object.freeze([
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1],
  [4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [3, -4], [2, -4], [1, -4],
  [0, -4], [-1, -4], [-2, -4], [-3, -4], [-4, -4], [-4, -3], [-4, -2], [-4, -1],
  [-4, 0], [-4, 1], [-4, 2], [-4, 3], [-4, 4], [-3, 4], [-2, 4], [-1, 4]
]);
const FAMILY_DIRECTION_VECTORS = Object.freeze([
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
]);
const tiltRowTraversalModes = new Uint8Array(height);
const tiltColumnTraversalModes = new Uint8Array(width);
const traversalFamilyDescriptors = [];
const traversalBucketDescriptors = [];
var activeRowMin = 0;
var activeRowMax = MAX_Y_IDX;
var activeColMin = 0;
var activeColMax = MAX_X_IDX;
var nextActiveRowMin = MAX_Y_IDX;
var nextActiveRowMax = -1;
var nextActiveColMin = MAX_X_IDX;
var nextActiveColMax = -1;

window.setGravityExperimentMode = function (mode, bucketIdx) {
  gravityExperimentMode = mode || "default";
  if (
    gravityExperimentMode === "bucket32" ||
    gravityExperimentMode === "radius2-32" ||
    gravityExperimentMode === "family32" ||
    gravityExperimentMode === "scanline32"
  )
    gravityBucketCount = 32;
  else gravityBucketCount = 16;
  if (typeof bucketIdx === "number") gravityBucketIndex = bucketIdx;
  if (gravityExperimentMode === "default") gravityState.strategy = "baseline";
  else if (gravityExperimentMode === "family32") gravityState.strategy = "family32";
  else if (gravityExperimentMode === "scanline32") gravityState.strategy = "family32";
  else gravityState.strategy = "baseline";
  syncGravityState();
  syncTiltModeCheckbox();
};

window.setGravityBucketIndex = function (bucketIdx) {
  gravityBucketIndex = bucketIdx;
  syncGravityState();
};

window.setTiltBenchmarkState = function (state) {
  if (state && state.strategy) {
    gravityState.strategy = state.strategy === "scanline32" ? "family32" : state.strategy;
    gravityExperimentMode = state.strategy;
    gravityBucketCount =
      state.strategy === "scanline32" || state.strategy === "family32" ? 32 : 16;
  }
  if (state && typeof state.bucket === "number") gravityBucketIndex = state.bucket;
  if (state && typeof state.strength === "number") gravityStrength = Math.max(0, Math.min(1, state.strength));
  syncGravityState();
  syncTiltModeCheckbox();
};

window.setTiltGravityVector = function (x, y) {
  projectTiltVector(x, y);
};

window.setTiltDeviceGravity = function (x, y, z) {
  projectTiltVector(x, y, z);
};

window.enableTiltMotionControls = enableTiltMotionControls;

async function lockGameOrientation(mode) {
  if (
    typeof screen === "undefined" ||
    !screen.orientation ||
    typeof screen.orientation.lock !== "function"
  ) return false;

  try {
    await screen.orientation.lock(mode);
    return true;
  } catch (err) {
    return false;
  }
}

function unlockGameOrientation() {
  if (
    typeof screen === "undefined" ||
    !screen.orientation ||
    typeof screen.orientation.unlock !== "function"
  ) return false;

  try {
    screen.orientation.unlock();
    return true;
  } catch (err) {
    return false;
  }
}

if (window.projectAmberPlatform && window.projectAmberPlatform.device) {
  window.projectAmberPlatform.device.enableTilt = enableTiltMotionControls;
  window.projectAmberPlatform.device.lockOrientation = lockGameOrientation;
  window.projectAmberPlatform.device.unlockOrientation = unlockGameOrientation;
}

window.getTiltBenchmarkState = function () {
  return {
    strategy: gravityState.strategy,
    bucket: gravityState.bucket,
    strength: gravityState.strength
  };
};

window.loadBenchmarkScene = function (name) {
  clearGameCanvas();

  if (name === "sand") {
    fillBenchmarkBand(SAND, 0.08, 0.48);
  } else if (name === "mixed") {
    fillBenchmarkBand(SAND, 0.08, 0.28);
    fillBenchmarkBand(WATER, 0.28, 0.48);
    fillBenchmarkBand(SOIL, 0.48, 0.58);
  } else if (name === "gas") {
    fillBenchmarkBand(STEAM, 0.08, 0.33);
    fillBenchmarkBand(CLOUD, 0.33, 0.58);
    fillBenchmarkBand(METHANE, 0.58, 0.78);
  }
};

/* ========================================================================= */

function initElementActionIndex() {
  for (var idx = 0; idx < elements.length; idx++) {
    ELEMENT_ACTION_INDEX[elements[idx] & 0x30303] = idx;
  }
}

function resetActiveBands() {
  activeRowMin = 0;
  activeRowMax = MAX_Y_IDX;
  activeColMin = 0;
  activeColMax = MAX_X_IDX;
}

function clearTiltBoundaryPixels() {
  var x;
  for (x = 0; x <= MAX_X_IDX; x++) {
    gameImagedata32[x] = BACKGROUND;
    const bottomIdx = x + MAX_Y_IDX * width;
    gameImagedata32[bottomIdx] = BACKGROUND;
  }

  var y;
  for (y = 0; y <= MAX_Y_IDX; y++) {
    const leftIdx = y * width;
    gameImagedata32[leftIdx] = BACKGROUND;
    const rightIdx = leftIdx + MAX_X_IDX;
    gameImagedata32[rightIdx] = BACKGROUND;
  }
}

function beginActiveBands() {
  nextActiveRowMin = MAX_Y_IDX;
  nextActiveRowMax = -1;
  nextActiveColMin = MAX_X_IDX;
  nextActiveColMax = -1;
}

function noteActiveBand(x, y) {
  if (y < nextActiveRowMin) nextActiveRowMin = y;
  if (y > nextActiveRowMax) nextActiveRowMax = y;
  if (x < nextActiveColMin) nextActiveColMin = x;
  if (x > nextActiveColMax) nextActiveColMax = x;
}

function finishActiveBands() {
  if (nextActiveRowMax === -1 || nextActiveColMax === -1) {
    activeRowMin = 0;
    activeRowMax = -1;
    activeColMin = 0;
    activeColMax = -1;
    return;
  }

  activeRowMin = Math.max(0, nextActiveRowMin - 2);
  activeRowMax = Math.min(MAX_Y_IDX, nextActiveRowMax + 2);
  activeColMin = Math.max(0, nextActiveColMin - 2);
  activeColMax = Math.min(MAX_X_IDX, nextActiveColMax + 2);
}

function syncGravityState() {
  const bucketCount = gravityBucketCount > 0 ? gravityBucketCount : 16;
  var bucket = gravityBucketIndex % bucketCount;
  if (bucket < 0) bucket += bucketCount;

  gravityState.bucket = bucket;
  gravityState.family = Math.floor((bucket * 8) / bucketCount) & 7;
  gravityState.strength = gravityStrength;
  if (gravityState.strategy === "family32") clearTiltBoundaryPixels();
}

function syncTiltModeCheckbox() {
  const tiltModeCheckbox = document.getElementById("tiltModeCheckbox");
  if (!tiltModeCheckbox) return;
  tiltModeCheckbox.checked = gravityState.strategy === "family32";
}

function getScreenOrientationAngle() {
  var angle = 0;
  if (typeof screen !== "undefined" && screen.orientation && typeof screen.orientation.angle === "number")
    angle = screen.orientation.angle;
  else if (typeof window.orientation === "number")
    angle = window.orientation;
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

function clampTiltAxis(value, maxTilt) {
  if (typeof value !== "number" || !isFinite(value)) return 0;
  if (value > maxTilt) return 1;
  if (value < -maxTilt) return -1;
  return value / maxTilt;
}

function mapDeviceOrientationToGravity(beta, gamma) {
  const maxTilt = 45;
  const frontBack = clampTiltAxis(beta, maxTilt);
  const sideToSide = clampTiltAxis(gamma, maxTilt);
  const orientation = getScreenOrientationAngle();
  var screenX = sideToSide;
  var screenY = frontBack;

  if (orientation === 90) {
    screenX = frontBack;
    screenY = -sideToSide;
  } else if (orientation === 180) {
    screenX = -sideToSide;
    screenY = -frontBack;
  } else if (orientation === 270) {
    screenX = -frontBack;
    screenY = sideToSide;
  }

  const radial = Math.min(1, Math.sqrt(screenX * screenX + screenY * screenY));
  const scale = radial > 1 ? 1 / radial : 1;
  screenX *= scale;
  screenY *= scale;
  return [screenX, screenY, Math.sqrt(Math.max(0, 1 - radial * radial))];
}

function handleTiltOrientation(event) {
  if (gravityState.strategy !== "family32") return;
  const mapped = mapDeviceOrientationToGravity(event.beta, event.gamma);
  const smoothing = 0.35;
  tiltMotionVectorX += (mapped[0] - tiltMotionVectorX) * smoothing;
  tiltMotionVectorY += (mapped[1] - tiltMotionVectorY) * smoothing;
  tiltMotionVectorZ += (mapped[2] - tiltMotionVectorZ) * smoothing;
  projectTiltVector(tiltMotionVectorX, tiltMotionVectorY, tiltMotionVectorZ);
}

async function enableTiltMotionControls() {
  if (typeof DeviceOrientationEvent === "undefined") {
    tiltMotionPermissionState = "unsupported";
    return false;
  }

  if (
    typeof DeviceOrientationEvent.requestPermission === "function" &&
    tiltMotionPermissionState !== "granted"
  ) {
    try {
      tiltMotionPermissionState = await DeviceOrientationEvent.requestPermission();
    } catch (err) {
      tiltMotionPermissionState = "denied";
      return false;
    }
    if (tiltMotionPermissionState !== "granted") return false;
  } else if (tiltMotionPermissionState === "unknown") {
    tiltMotionPermissionState = "granted";
  }

  if (!tiltMotionListenerAttached) {
    window.addEventListener("deviceorientation", handleTiltOrientation, true);
    tiltMotionListenerAttached = true;
  }
  return true;
}

function projectTiltVector(x, y, z) {
  const screenX = typeof x === "number" ? x : 0;
  const screenY = typeof y === "number" ? y : 0;
  const screenZ = typeof z === "number" ? z : 0;
  const magnitude = Math.sqrt(screenX * screenX + screenY * screenY);
  const fullMagnitude = Math.sqrt(screenX * screenX + screenY * screenY + screenZ * screenZ);
  const normalizedMagnitude = fullMagnitude > 0 ? magnitude / fullMagnitude : magnitude;
  const strength = Math.max(0, Math.min(1, normalizedMagnitude));
  const deadband = 0.08;

  gravityStrength = strength <= deadband ? 0 : (strength - deadband) / (1 - deadband);
  if (gravityStrength > 0) {
    const angle = Math.atan2(screenX, screenY);
    const rawBucket = Math.round((angle / TWO_PI) * gravityBucketCount);
    gravityBucketIndex = rawBucket;
  }
  syncGravityState();
}

function fillBenchmarkBand(elem, startRatio, endRatio) {
  resetActiveBands();
  const startX = Math.floor(width * startRatio);
  const endX = Math.floor(width * endRatio);
  const bandHeight = Math.max(8, Math.floor(height * 0.08));
  var y, x;
  for (y = 0; y < bandHeight; y++) {
    const rowOffset = y * width;
    for (x = startX; x < endX; x++) {
      if (random() < 85) gameImagedata32[rowOffset + x] = elem;
    }
  }
}

function initTiltTraversalModes() {
  var i;
  for (i = 0; i < height; i++) {
    tiltRowTraversalModes[i] = ((i * 5) ^ (i >> 1)) & 3;
  }
  for (i = 0; i < width; i++) {
    tiltColumnTraversalModes[i] = ((i * 3) ^ (i >> 2)) & 3;
  }
}

function buildTraversalDescriptor(dirX, dirY) {
  const tangentX = -dirY;
  const tangentY = dirX;
  const starts = [];
  const visitedStarts = {};
  var x, y;

  function maybeAddStart(startX, startY) {
    if (startX < 0 || startX > MAX_X_IDX || startY < 0 || startY > MAX_Y_IDX) return;
    const prevX = startX - tangentX;
    const prevY = startY - tangentY;
    if (prevX >= 0 && prevX <= MAX_X_IDX && prevY >= 0 && prevY <= MAX_Y_IDX) return;

    const key = startX + "," + startY;
    if (key in visitedStarts) return;
    visitedStarts[key] = true;
    starts.push([startX, startY]);
  }

  for (x = 0; x < width; x++) {
    maybeAddStart(x, 0);
    maybeAddStart(x, MAX_Y_IDX);
  }
  for (y = 0; y < height; y++) {
    maybeAddStart(0, y);
    maybeAddStart(MAX_X_IDX, y);
  }

  starts.sort(function (a, b) {
    return b[0] * dirX + b[1] * dirY - (a[0] * dirX + a[1] * dirY);
  });

  const descriptor = [];
  var lineIdx;
  for (lineIdx = 0; lineIdx < starts.length; lineIdx++) {
    const start = starts[lineIdx];
    var lineX = start[0];
    var lineY = start[1];
    var length = 0;
    while (lineX >= 0 && lineX <= MAX_X_IDX && lineY >= 0 && lineY <= MAX_Y_IDX) {
      length++;
      lineX += tangentX;
      lineY += tangentY;
    }

    if (length === 0) continue;

    const reverse = (lineIdx & 1) === 1;
    var startX = start[0];
    var startY = start[1];
    var stepX = tangentX;
    var stepY = tangentY;
    if (reverse) {
      startX = start[0] + tangentX * (length - 1);
      startY = start[1] + tangentY * (length - 1);
      stepX = -tangentX;
      stepY = -tangentY;
    }

    descriptor.push({
      startX: startX,
      startY: startY,
      stepX: stepX,
      stepY: stepY,
      length: length
    });
  }

  return descriptor;
}

function initTraversalDescriptors() {
  var i;
  traversalFamilyDescriptors.length = 0;
  for (i = 0; i < FAMILY_DIRECTION_VECTORS.length; i++) {
    const dir = FAMILY_DIRECTION_VECTORS[i];
    traversalFamilyDescriptors.push(buildTraversalDescriptor(dir[0], dir[1]));
  }

  traversalBucketDescriptors.length = 0;
  for (i = 0; i < 32; i++) {
    const dir = TILT_BUCKET_VECTORS_32[i];
    traversalBucketDescriptors.push(buildTraversalDescriptor(dir[0], dir[1]));
  }
}

function init() {

  /* setting FPS must occur before initMenu() */
  setFPS(DEFAULT_FPS);

  initCursors();
  initElements();
  initElementActionIndex();
  initParticles();
  initSpigots();
  initMenu();
  if (window.projectAmberPlatform && window.projectAmberPlatform.haptics) {
    window.projectAmberPlatform.haptics.init();
  }
  if (typeof initTooltips === "function") initTooltips();
  initSoftBody();
  initTiltTraversalModes();
  initTraversalDescriptors();
  syncGravityState();
  syncTiltModeCheckbox();

  /* Initialize imagedata */
  const len = gameImagedata32.length;
  for (var i = 0; i < len; i++) {
    gameImagedata32[i] = BACKGROUND;
    saveGameImagedata32[i] = BACKGROUND;
  }

  /* Nice crisp pixels, regardless of pixel ratio */
  onscreenCtx.mozImageSmoothingEnabled = false;
  onscreenCtx.imageSmoothingEnabled = false;
  onscreenCtx.webkitImageSmoothingEnabled = false;
  onscreenCtx.msImageSmoothingEnabled = false;
  onscreenCtx.oImageSmoothingEnabled = false;
}

function setFPS(fps) {
  fpsSetting = fps;
  if (fps > 0) msPerFrame = 1000.0 / fpsSetting;
  else drawFPSLabel(0);
}
function updateGame() {
  tiltTraversalPhase = (tiltTraversalPhase + 1) & 7;
  syncFrameGravity();
  updateSpigots();
  updateParticles();

  if (gravityState.strategy === "family32") {
    clearTiltBoundaryPixels();
    updateGameFamily32();
    perfRecordFrame();
    frameDebt--;
    return;
  }

  var x, y;
  var i = MAX_IDX;
  /*
   * Since i starts at MAX_IDX, we need to guarantee that we will start
   * our traversal by going to the left.
   */
  const direction = MAX_Y_IDX & 1;

  /*
   * Iterate the canvas from the bottom to top, zigzagging
   * the rows left and right.
   * To optimize for speed, we duplicate the code for the
   * left->right and right->left cases, as this is our hottest
   * inner path. This sacrifices readability, and violates DRY,
   * but is necessary for game performance.
   */
  for (y = MAX_Y_IDX; y !== -1; y--) {
    const Y = y;
    if ((Y & 1) === direction) {
      for (x = MAX_X_IDX; x !== -1; x--) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i--;
          continue; /* optimize to skip background */
        }
        if (elem === WALL) {
          i--;
          continue;
        }
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i--;
      }
      i++;
    } else {
      for (x = 0; x !== width; x++) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i++;
          continue;
        }
        if (elem === WALL) {
          i++;
          continue;
        }
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i++;
      }
      i--;
    }
    i -= width;
  }

  perfRecordFrame();
  frameDebt--;
}

function updateGameFamily32() {
  const bucketVector = TILT_BUCKET_VECTORS_32[gravityState.bucket];
  const dx = bucketVector[0];
  const dy = bucketVector[1];
  const absDx = dx < 0 ? -dx : dx;
  const absDy = dy < 0 ? -dy : dy;
  beginActiveBands();

  if (absDx > absDy) {
    const colStart = Math.max(0, activeColMin);
    const colStop = Math.min(MAX_X_IDX, activeColMax);
    if (colStart > colStop) {
      finishActiveBands();
      return;
    }
    if (dx > 0) updateGameColumns(colStop, colStart - 1, -1, colStop & 1);
    else updateGameColumns(colStart, colStop + 1, 1, colStart & 1);
    finishActiveBands();
    return;
  }

  const rowStart = Math.max(0, activeRowMin);
  const rowStop = Math.min(MAX_Y_IDX, activeRowMax);
  if (rowStart > rowStop) {
    finishActiveBands();
    return;
  }
  if (dy < 0) {
    updateGameRows(rowStart, rowStop + 1, 1, rowStart & 1);
    finishActiveBands();
    return;
  }

  updateGameRows(rowStop, rowStart - 1, -1, rowStop & 1);
  finishActiveBands();
}

function updateGameRows(yStart, yStop, yStep, direction) {
  var x, y;
  var i;

  for (y = yStart; y !== yStop; y += yStep) {
    const Y = y;
    const lineJitter = (tiltRowTraversalModes[Y] + tiltTraversalPhase) & 3;
    if (lineJitter === 0 || lineJitter === 3) {
      i = MAX_X_IDX + Y * width;
      for (x = MAX_X_IDX; x !== -1; x--) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i--;
          continue;
        }
        if (elem === WALL) {
          i--;
          continue;
        }
        noteActiveBand(x, Y);
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i--;
      }
    } else if (lineJitter === 1) {
      i = Y * width;
      for (x = 0; x !== width; x++) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i++;
          continue;
        }
        if (elem === WALL) {
          i++;
          continue;
        }
        noteActiveBand(x, Y);
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i++;
      }
    } else if ((Y & 1) === direction) {
      i = MAX_X_IDX + Y * width;
      for (x = MAX_X_IDX; x !== -1; x--) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i--;
          continue;
        }
        if (elem === WALL) {
          i--;
          continue;
        }
        noteActiveBand(x, Y);
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i--;
      }
    } else {
      i = Y * width;
      for (x = 0; x !== width; x++) {
        const elem = gameImagedata32[i];
        if (elem === BACKGROUND) {
          i++;
          continue;
        }
        if (elem === WALL) {
          i++;
          continue;
        }
        noteActiveBand(x, Y);
        if (elem === SAND) SAND_ACTION(x, Y, i);
        else if (elem === WATER) WATER_ACTION(x, Y, i);
        else if (elem === SALT_WATER) SALT_WATER_ACTION(x, Y, i);
        else {
          const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
          elementActions[elem_idx](x, Y, i);
        }
        i++;
      }
    }
  }
}

function updateGameColumns(xStart, xStop, xStep, direction) {
  var x, y;
  var i = xStart;

  for (x = xStart; x !== xStop; x += xStep) {
    const X = x;
    const lineJitter = (tiltColumnTraversalModes[X] + tiltTraversalPhase) & 3;
    if (lineJitter === 0 || lineJitter === 3) {
      i = x + MAX_Y_IDX * width;
      for (y = MAX_Y_IDX; y !== -1; y--) {
        const elem = gameImagedata32[i];
        if (elem !== BACKGROUND) {
          if (elem !== WALL) {
            noteActiveBand(X, y);
            if (elem === SAND) SAND_ACTION(X, y, i);
            else if (elem === WATER) WATER_ACTION(X, y, i);
            else if (elem === SALT_WATER) SALT_WATER_ACTION(X, y, i);
            else {
              const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
              elementActions[elem_idx](X, y, i);
            }
          }
        }
        i -= width;
      }
    } else if (lineJitter === 1) {
      i = x;
      for (y = 0; y !== height; y++) {
        const elem = gameImagedata32[i];
        if (elem !== BACKGROUND) {
          if (elem !== WALL) {
            noteActiveBand(X, y);
            if (elem === SAND) SAND_ACTION(X, y, i);
            else if (elem === WATER) WATER_ACTION(X, y, i);
            else if (elem === SALT_WATER) SALT_WATER_ACTION(X, y, i);
            else {
              const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
              elementActions[elem_idx](X, y, i);
            }
          }
        }
        i += width;
      }
    } else if ((X & 1) === direction) {
      i = x + MAX_Y_IDX * width;
      for (y = MAX_Y_IDX; y !== -1; y--) {
        const elem = gameImagedata32[i];
        if (elem !== BACKGROUND) {
          if (elem !== WALL) {
            noteActiveBand(X, y);
            if (elem === SAND) SAND_ACTION(X, y, i);
            else if (elem === WATER) WATER_ACTION(X, y, i);
            else if (elem === SALT_WATER) SALT_WATER_ACTION(X, y, i);
            else {
              const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
              elementActions[elem_idx](X, y, i);
            }
          }
        }
        i -= width;
      }
    } else {
      i = x;
      for (y = 0; y !== height; y++) {
        const elem = gameImagedata32[i];
        if (elem !== BACKGROUND) {
          if (elem !== WALL) {
            noteActiveBand(X, y);
            if (elem === SAND) SAND_ACTION(X, y, i);
            else if (elem === WATER) WATER_ACTION(X, y, i);
            else if (elem === SALT_WATER) SALT_WATER_ACTION(X, y, i);
            else {
              const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
              elementActions[elem_idx](X, y, i);
            }
          }
        }
        i += width;
      }
    }
  }
}

function updateGameWithDescriptor(descriptor) {
  if (!descriptor) return;

  var lineIdx;
  for (lineIdx = 0; lineIdx < descriptor.length; lineIdx++) {
    const line = descriptor[lineIdx];
    var x = line.startX;
    var y = line.startY;
    var i = x + y * width;
    const stepI = line.stepX + line.stepY * width;
    var iter;
    for (iter = 0; iter < line.length; iter++) {
      const elem = gameImagedata32[i];
      if (elem !== BACKGROUND) {
        const elem_idx = ELEMENT_ACTION_INDEX[elem & 0x30303];
        elementActions[elem_idx](x, y, i);
      }
      x += line.stepX;
      y += line.stepY;
      i += stepI;
    }
  }
}

function draw() {
  gameCtx.putImageData(gameImagedata, 0, 0);

  /*
   * To make sure our game looks crisp, we need to handle
   * device pixel ratio. We do this by taking our offscreen
   * game canvas (at our ingame resolution), and then scaling
   * and transferring it to the displayed canvas.
   */
  onscreenCtx.setTransform(onscreenPixelRatio, 0, 0, onscreenPixelRatio, 0, 0);
  onscreenCtx.drawImage(gameCanvas, 0, 0, width, height);
  onscreenCtx.drawImage(offscreenParticleCanvas, 0, 0, width, height);
}

function setGameCanvas(elem) {
  resetActiveBands();
  const iterEnd = MAX_IDX + 1;
  for (var i = 0; i !== iterEnd; i++) {
    gameImagedata32[i] = elem;
  }
}

function clearGameCanvas() {
  particles.inactivateAll();
  setGameCanvas(BACKGROUND);
}

/*
 * Saves the current canvas state. Note that we don't also save particle state.
 */
function saveGameCanvas() {
  /*
   * Copy it manually, rather than use a slice, so that we can use a constant
   * global pointer.
   */
  const iterEnd = MAX_IDX + 1;
  for (var i = 0; i !== iterEnd; i++)
    saveGameImagedata32[i] = gameImagedata32[i];

  gamestateSaved = true;
}

function loadGameCanvas() {
  if (!gamestateSaved) return;

  particles.inactivateAll();

  const iterEnd = MAX_IDX + 1;
  for (var i = 0; i !== iterEnd; i++)
    gameImagedata32[i] = saveGameImagedata32[i];
  resetActiveBands();
}

/* Signal that we've updated a game frame to our FPS counter */
function perfRecordFrame() {
  const now = performance.now();
  const oneSecondAgo = now - 1000;
  while (refreshTimesStart < refreshTimes.length && refreshTimes[refreshTimesStart] <= oneSecondAgo) {
    refreshTimesStart++;
  }
  refreshTimes.push(now);

  if (refreshTimesStart > 64 && refreshTimesStart * 2 > refreshTimes.length) {
    refreshTimes.splice(0, refreshTimesStart);
    refreshTimesStart = 0;
  }

  if (now - lastFPSLabelUpdate > 200) {
    drawFPSLabel(refreshTimes.length - refreshTimesStart);
    lastFPSLabelUpdate = now;
  }
}

function mainLoop(now) {
  window.requestAnimationFrame(mainLoop);

  /* Handle initial update */
  if (lastLoop === 0) {
    lastLoop = now;
    return;
  }

  const deltaMs = now - lastLoop;
  lastLoop = now;
  if (deltaMs < 0) {
    console.log("time has gone backwards");
    return;
  }

  if (fpsSetting > 0) frameDebt += deltaMs / msPerFrame;

  /*
   * Avoid accumulating too much frame debt, which can
   * occur, for example, from:
   * - animation loop being paused due to loss of browser
   *   tab focus
   * - excessive time needed for updateGame() due to
   *   complex update
   *
   * Naturally, this also limits our max theoretical FPS, but
   * our MAX_FPS is set lower than this limit anyway.
   */
  frameDebt = Math.min(frameDebt, 5);

  /*
   * Always update the user stroke, regardless of whether
   * we're updating the gamestate. This results in smooth
   * drawing regardless of the current set FPS.
   *
   * Stop drawing the stroke if we're dragging a soft body,
   * since we don't want both at once.
   */
  if (!softBodyDragStart) {
    updateUserStroke();
  }

  var framesUpdated = 0;
  if (frameDebt >= 1) {
    if (frameDebt == 1) {
      /* shortcut for the common case of a single-frame update */
      updateGame();
      framesUpdated++;
    } else {
      /* multi-frame update */

      /* first get approx time for a single update */
      const updateTimeMs = executeAndTime(updateGame);
      framesUpdated++;

      /*
       * Approx time for doing stroke, draw, etc.
       * This is very rough and could be improved.
       */
      const loopMiscTimeMs = 3.5;
      var timeRemaining = deltaMs - loopMiscTimeMs - updateTimeMs;
      while (timeRemaining > updateTimeMs && frameDebt >= 1) {
        updateGame();
        timeRemaining -= updateTimeMs;
        framesUpdated++;
      }
    }
  }

  if (framesUpdated) {
    softBodyAnimate(framesUpdated * ZOMBIE_ANIMATION_SPEED);
    softBodyRender();
  }

  draw();
}

window.onload = function () {
  init();
  mainLoop(0);
};
