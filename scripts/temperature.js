/*
 * Lightweight toy temperature helpers for the Bellamy universe slice.
 */

const AMBIENT_TEMP = 0;
const TEMP_WATER_EVAPORATES = 12;
const TEMP_STEAM_CONDENSES = 3;
const TEMP_SOIL_DRIES = 10;
const TEMP_PLANT_STRESS = 16;
const TEMP_RAIN_CLOUDS = 2;

const temperatureField = new Int16Array(width * height);

function initTemperature() {
  for (var i = 0; i !== temperatureField.length; i++) {
    temperatureField[i] = AMBIENT_TEMP;
  }
}

function applyTemperaturePhysics() {
  for (var i = 0; i !== temperatureField.length; i++) {
    const elem = gameImagedata32[i];
    var target = AMBIENT_TEMP;

    if (elem === FIRE) target = 24;
    else if (elem === LAVA) target = 36;
    else if (elem === SUN) target = 30;
    else if (elem === CRYO) target = -30;
    else if (elem === STEAM) target = 10;
    else if (elem === ICE) target = -8;
    else if (elem === CLOUD) target = 1;
    else if (elem === RAIN) target = 2;

    const current = temperatureField[i];
    if (current < target) temperatureField[i] = current + 1;
    else if (current > target) temperatureField[i] = current - 1;
  }
}

function getTemperatureAt(i) {
  return temperatureField[i];
}

function addTemperatureAt(i, delta) {
  temperatureField[i] += delta;
}

function hasElementAboveInColumn(x, y, elemType) {
  var row;
  for (row = y - 1; row >= 0; row--) {
    const idx = row * width + x;
    if (gameImagedata32[idx] === elemType) return true;
  }
  return false;
}

function hasSkyExposure(x, y, i) {
  var row;
  for (row = y - 1; row >= 0; row--) {
    const idx = row * width + x;
    const elem = gameImagedata32[idx];
    if (elem !== BACKGROUND && elem !== STEAM && elem !== CLOUD && elem !== SUN) {
      return false;
    }
  }
  return true;
}

function isHeatedBySun(x, y, i) {
  return hasSkyExposure(x, y, i) || hasElementAboveInColumn(x, y, SUN);
}
