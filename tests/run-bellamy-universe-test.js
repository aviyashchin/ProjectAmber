const {
  testUniverseScriptsAreLoaded,
  testWeatherElementsExist,
  testTemperatureLoopExists,
  testBellamyDescriptionsExist,
  testPlantGrowthUsesLocalChecks,
  testWeatherStateAndForceFamilies,
  testColorFamiliesStayCoherent,
  testTemperatureLoopIsSparse,
  testSunlightChecksAreBounded,
  testMethaneStaysLocalAndCheap,
  testBlackHoleStaysLocal
} = require("./bellamyUniverse.test.js");

try {
  testUniverseScriptsAreLoaded();
  testWeatherElementsExist();
  testTemperatureLoopExists();
  testBellamyDescriptionsExist();
  testPlantGrowthUsesLocalChecks();
  testWeatherStateAndForceFamilies();
  testColorFamiliesStayCoherent();
  testTemperatureLoopIsSparse();
  testSunlightChecksAreBounded();
  testMethaneStaysLocalAndCheap();
  testBlackHoleStaysLocal();
  console.log("PASS Bellamy universe regression");
} catch (error) {
  console.error("FAIL Bellamy universe regression");
  console.error(error.message);
  process.exit(1);
}
