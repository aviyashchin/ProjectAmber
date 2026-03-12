const {
  testPaletteUsesBellamyGroups,
  testCanvasBorderIsAlwaysRemoved
} = require("./menuGrouping.test.js");

try {
  testPaletteUsesBellamyGroups();
  testCanvasBorderIsAlwaysRemoved();
  console.log("PASS menu grouping regression");
} catch (error) {
  console.error("FAIL menu grouping regression");
  console.error(error.message);
  process.exit(1);
}
