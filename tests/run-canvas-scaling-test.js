const {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas,
  testCanvasSizingUsesLayoutViewport
} = require("./canvasScaling.test.js");

try {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas();
  testCanvasSizingUsesLayoutViewport();
  console.log("PASS canvas scaling regression");
} catch (error) {
  console.error("FAIL canvas scaling regression");
  console.error(error.message);
  process.exit(1);
}
