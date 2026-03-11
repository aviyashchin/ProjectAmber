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
  testForceAndGrowthSystemsAreThrottled,
  testCloudsThinWhenTheyRain,
  testTiltGravityExperimentSwitchExists,
  testTiltGravityCandidatesStayLocal,
  testTiltGravityBenchmarkNotesExist,
  testPlatformSeamAndHapticsExist
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
  testCloudsThinWhenTheyRain();
  testTiltGravityExperimentSwitchExists();
  testTiltGravityCandidatesStayLocal();
  testTiltGravityBenchmarkNotesExist();
  testPlatformSeamAndHapticsExist();
  console.log("PASS Bellamy universe regression");
} catch (error) {
  console.error("FAIL Bellamy universe regression");
  console.error(error.message);
  process.exit(1);
}
