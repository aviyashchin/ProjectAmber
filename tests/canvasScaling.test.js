const fs = require("fs");
const path = require("path");

function getGameJsSource() {
  return fs.readFileSync(path.join(__dirname, "..", "scripts", "game.js"), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testDrawHandlesDevicePixelRatioOnOnscreenCanvas() {
  const source = getGameJsSource();

  assert(
    !source.includes("gameCtx.scale(onscreenPixelRatio, onscreenPixelRatio);"),
    "draw() should not scale the offscreen game context"
  );

  assert(
    source.includes("onscreenCtx.setTransform(onscreenPixelRatio, 0, 0, onscreenPixelRatio, 0, 0);"),
    "draw() should set the onscreen context transform from the device pixel ratio"
  );

  assert(
    source.includes("onscreenCtx.drawImage(gameCanvas, 0, 0, width, height);"),
    "draw() should draw the game canvas at the logical game size"
  );
}

module.exports = {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas
};
