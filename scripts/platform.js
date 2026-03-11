/*
 * Browser-backed platform hooks for Bellamy.
 *
 * Keeps haptics and device APIs outside gameplay code so web and later
 * native app wrappers can share the same surface.
 */
(function () {
  const hapticsState = {
    enabled: true,
    supported: false,
    lastPulse: 0,
    minInterval: 50
  };
  var drawCounter = 0;

  function updateButton() {
    const button = document.getElementById("hapticsButton");
    if (!button) return;
    button.value = hapticsState.enabled ? "Haptics: ON" : "Haptics: OFF";
  }

  function canVibrate() {
    return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  }

  function pulse(pattern) {
    if (!hapticsState.enabled || !hapticsState.supported) return false;

    const now = Date.now();
    if (now - hapticsState.lastPulse < hapticsState.minInterval) return false;
    hapticsState.lastPulse = now;
    navigator.vibrate(pattern);
    return true;
  }

  function init() {
    hapticsState.supported = canVibrate();
    updateButton();
    return hapticsState.supported;
  }

  function toggle() {
    hapticsState.enabled = !hapticsState.enabled;
    updateButton();
    if (hapticsState.enabled) medium();
    return hapticsState.enabled;
  }

  function light() {
    return pulse(10);
  }

  function medium() {
    return pulse(20);
  }

  function heavy() {
    return pulse(35);
  }

  function draw() {
    drawCounter++;
    if (drawCounter % 3 === 0) light();
  }

  async function enableTilt() {
    if (typeof window.enableTiltMotionControls === "function")
      return window.enableTiltMotionControls();
    return false;
  }

  async function lockOrientation(mode) {
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

  function unlockOrientation() {
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

  window.projectAmberPlatform = {
    haptics: {
      state: hapticsState,
      init: init,
      toggle: toggle,
      light: light,
      medium: medium,
      heavy: heavy,
      draw: draw
    },
    device: {
      enableTilt: enableTilt,
      lockOrientation: lockOrientation,
      unlockOrientation: unlockOrientation
    }
  };
})();
