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
  testTiltGravityBenchmarkNotesExist
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
  console.log("PASS Bellamy universe regression");
} catch (error) {
  console.error("FAIL Bellamy universe regression");
  console.error(error.message);
  process.exit(1);
}
