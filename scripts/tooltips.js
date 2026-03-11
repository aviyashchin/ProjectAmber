/*
 * Kid-readable element descriptions and simple guided prompts for Bellamy.
 */

const BELLAMY_ELEMENT_INFO = {
  Sun: "A tiny warm star. It heats nearby things.",
  "Anti-G": "A floaty force tool. It lifts nearby things upward.",
  Sand: "Falls, piles up, and makes hills.",
  Water: "Flows downhill and fills spaces.",
  Rain: "Falling water from clouds.",
  Cloud: "Cool mist that can rain",
  Steam: "Hot water that rises",
  Fire: "Hot and hungry. It spreads through burnable stuff.",
  Cryo: "A tiny cold star. It freezes nearby things.",
  "Black Hole": "A super gravity spot that pulls nearby things in.",
  Soil: "Holds water for plants",
  "Wet Soil": "A soaked sponge for roots and seeds.",
  Plant: "Soft life that spreads when water is nearby.",
  Tree: "Woody life that grows upward",
  Ice: "Frozen water that melts when warmed.",
  Lava: "Molten rock that burns and cools into stone.",
  Spout: "Makes water forever.",
  Well: "Makes oil forever.",
  Zombie: "A wandering hand for weird sandbox chaos."
  ,
  Mystery: "A weird experiment block. Try it when you want surprises.",
  Discovery: "Weird science toys for brave experiments."
};

const WORLD_IDEAS = [
  "Make Rain: Put Sun under Water and watch steam climb.",
  "Grow a Forest: Wet the Soil, drop Seeds, then add some Rain.",
  "Dry a Swamp: Use Sun and Fire to chase the water away.",
  "Cool a Volcano: Pour Rain on Lava and look for new Rock.",
  "Build a Storm: Stack Clouds until they sag and start raining.",
  "Bend Space: Drop a Black Hole and watch nearby stuff fall inward."
];

function getElementDisplayName(elemType) {
  if (elemType === ZOMBIE) return "HAND";
  if (typeof menuNames !== "undefined" && elemType in menuNames) {
    return menuNames[elemType];
  }
  return "ELEMENT";
}

function getElementInfoText(elemType) {
  const label = getElementDisplayName(elemType);
  if (label === "SOIL") return BELLAMY_ELEMENT_INFO.Soil;
  if (label === "WET SOIL") return BELLAMY_ELEMENT_INFO["Wet Soil"];
  if (label === "SUN") return BELLAMY_ELEMENT_INFO.Sun;
  if (label === "ANTI-G") return BELLAMY_ELEMENT_INFO["Anti-G"];
  if (label === "SAND") return BELLAMY_ELEMENT_INFO.Sand;
  if (label === "WATER") return BELLAMY_ELEMENT_INFO.Water;
  if (label === "RAIN") return BELLAMY_ELEMENT_INFO.Rain;
  if (label === "CLOUD") return BELLAMY_ELEMENT_INFO.Cloud;
  if (label === "STEAM") return BELLAMY_ELEMENT_INFO.Steam;
  if (label === "FIRE") return BELLAMY_ELEMENT_INFO.Fire;
  if (label === "CRYO") return BELLAMY_ELEMENT_INFO.Cryo;
  if (label === "BLACK HOLE") return BELLAMY_ELEMENT_INFO["Black Hole"];
  if (label === "PLANT") return BELLAMY_ELEMENT_INFO.Plant;
  if (label === "TREE") return BELLAMY_ELEMENT_INFO.Tree;
  if (label === "ICE") return BELLAMY_ELEMENT_INFO.Ice;
  if (label === "LAVA") return BELLAMY_ELEMENT_INFO.Lava;
  if (label === "SPOUT") return BELLAMY_ELEMENT_INFO.Spout;
  if (label === "WELL") return BELLAMY_ELEMENT_INFO.Well;
  if (label === "HAND") return BELLAMY_ELEMENT_INFO.Zombie;
  if (label === "???") return BELLAMY_ELEMENT_INFO.Mystery;
  return "Try mixing it with something nearby and see what happens.";
}

function updateElementInfoPanel(elemType) {
  const nameEl = document.getElementById("elementInfoName");
  const descEl = document.getElementById("elementInfoDesc");
  if (!nameEl || !descEl) return;

  nameEl.textContent = getElementDisplayName(elemType);
  descEl.textContent = getElementInfoText(elemType);
}

function initTooltips() {
  const worldIdeas = document.getElementById("worldIdeas");
  if (worldIdeas) {
    for (var i = 0; i < WORLD_IDEAS.length; i++) {
      const idea = document.createElement("div");
      idea.className = "worldIdea";
      idea.textContent = WORLD_IDEAS[i];
      worldIdeas.appendChild(idea);
    }
  }

  if (typeof SELECTED_ELEM !== "undefined") {
    updateElementInfoPanel(SELECTED_ELEM);
  }
}
