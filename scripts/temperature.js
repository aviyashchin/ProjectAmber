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
const sunExposureField = new Uint8Array(width * height);
var temperatureCursor = 0;

function initTemperature() {
  for (var i = 0; i !== temperatureField.length; i++) {
    temperatureField[i] = AMBIENT_TEMP;
    sunExposureField[i] = 0;
  }
}

function applyTemperaturePhysics() {
  rebuildSunExposureField();

  const tempBudget = Math.max(1024, Math.floor(temperatureField.length / 6));
  const tempEnd = Math.min(temperatureCursor + tempBudget, temperatureField.length);
  var i;
  for (i = temperatureCursor; i !== tempEnd; i++) {
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

  temperatureCursor = tempEnd;
  if (temperatureCursor >= temperatureField.length) temperatureCursor = 0;
}

function getTemperatureAt(i) {
  return temperatureField[i];
}

function addTemperatureAt(i, delta) {
  temperatureField[i] += delta;
}

function rebuildSunExposureField() {
  var x, y;
  for (x = 0; x !== width; x++) {
    var sunSeen = false;
    var skyOpen = true;
    for (y = 0; y !== height; y++) {
      const idx = y * width + x;
      const elem = gameImagedata32[idx];

      if (elem === SUN) sunSeen = true;

      if (skyOpen || sunSeen) sunExposureField[idx] = 1;
      else sunExposureField[idx] = 0;

      if (elem !== BACKGROUND && elem !== STEAM && elem !== CLOUD && elem !== SUN) {
        skyOpen = false;
      }
    }
  }
}

function isHeatedBySun(x, y, i) {
  return sunExposureField[i] === 1;
}
