const {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas
} = require("./canvasScaling.test.js");

try {
  testDrawHandlesDevicePixelRatioOnOnscreenCanvas();
  console.log("PASS canvas scaling regression");
} catch (error) {
  console.error("FAIL canvas scaling regression");
  console.error(error.message);
  process.exit(1);
}
