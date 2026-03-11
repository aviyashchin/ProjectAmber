const {
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
  testForceAndGrowthSystemsAreThrottled
} = require("./bellamyUniverse.test.js");

try {
  testUniverseScriptsAreLoaded();
  testWeatherElementsExist();
  testTemperatureLoopExists();
  testBellamyDescriptionsExist();
  testPlantGrowthUsesLocalChecks();
  testWeatherStateAndForceFamilies();
  testColorFamiliesStayCoherent();
  testNoTemperatureControlPlaneRemains();
  testMethaneStaysLocalAndCheap();
  testBlackHoleStaysLocal();
  testForceAndGrowthSystemsAreThrottled();
  console.log("PASS Bellamy universe regression");
} catch (error) {
  console.error("FAIL Bellamy universe regression");
  console.error(error.message);
  process.exit(1);
}
