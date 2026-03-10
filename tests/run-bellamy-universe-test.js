const {
  testUniverseScriptsAreLoaded,
  testWeatherElementsExist,
  testTemperatureLoopExists,
  testBellamyDescriptionsExist,
  testPlantGrowthUsesLocalChecks
} = require("./bellamyUniverse.test.js");

try {
  testUniverseScriptsAreLoaded();
  testWeatherElementsExist();
  testTemperatureLoopExists();
  testBellamyDescriptionsExist();
  testPlantGrowthUsesLocalChecks();
  console.log("PASS Bellamy universe regression");
} catch (error) {
  console.error("FAIL Bellamy universe regression");
  console.error(error.message);
  process.exit(1);
}
