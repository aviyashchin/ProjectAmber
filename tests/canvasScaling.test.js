const fs = require("fs");
const path = require("path");

function getGameJsSource() {
  return fs.readFileSync(path.join(__dirname, "..", "scripts", "game.js"), "utf8");
}

function getCanvasConfigSource() {
  return fs.readFileSync(path.join(__dirname, "..", "scripts", "canvasConfig.js"), "utf8");
}

function getStylesSource() {
  return fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
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

function testCanvasSizingUsesLayoutViewport() {
  const source = getCanvasConfigSource();
  const styles = getStylesSource();

  assert(
    source.includes("document.documentElement.clientWidth"),
    "canvas width should size from document.documentElement.clientWidth"
  );

  assert(
    source.includes("document.documentElement.clientHeight"),
    "canvas height should size from document.documentElement.clientHeight"
  );

  assert(
    styles.includes("width: 100%;"),
    "wrapper should use width: 100% to avoid 100vw scrollbar overhang"
  );
}

module.exports = {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas,
  testCanvasSizingUsesLayoutViewport
};
