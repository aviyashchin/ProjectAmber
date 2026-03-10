# Bellamy Universe Design

## Goal
Evolve Project Amber into a fun sandbox for a curious 12-and-under player named Bellamy: a world where painting elements creates understandable, playful, science-inspired systems such as weather, water flow, fire, growth, decay, and terrain change.

## Product Direction
Project Amber should remain a fast, tactile falling-sand toy. The current core loop is already fun and reliable, so this design builds on top of it rather than replacing it.

The target feeling is:
- Easy to play in under 10 seconds
- Deep enough to discover patterns over many sessions
- Grounded enough that a child can ask "why did that happen?" and get a satisfying answer
- Coherent enough that many outcomes emerge from a few systems instead of dozens of isolated tricks

The product is not a strict scientific simulator. It is a toy universe with scientific coherence.

## Non-Goals
- Do not rewrite the core pixel simulation engine
- Do not turn the game into a chemistry textbook
- Do not pursue perfect conservation laws if they hurt readability or fun
- Do not add large numbers of bespoke pairwise reactions as the primary expansion strategy

## Core Principle
Keep the current element-painting sandbox and introduce a light shared world model above it.

The evolution path is:
1. Preserve the core falling-sand toy
2. Add a small number of world systems
3. Re-express existing elements in terms of those systems
4. Add new interactions where they clearly fall out of the shared rules

## Audience
Bellamy is the design anchor:
- Curious
- Wants to poke and hack the universe
- Likes immediate feedback
- Can handle real concepts if presented through play and visuals
- Benefits from simple labels, visible cause/effect, and discoverable depth

## Design Pillars
1. Fun first
If a scientifically correct behavior feels boring or invisible, simplify it until it becomes playful.

2. Science-shaped, not science-dominated
Use real ideas like evaporation, condensation, infiltration, combustion, and germination. Avoid pedantic realism that adds complexity without delight.

3. Systems over exceptions
Prefer a few shared properties and always-on rules over many hardcoded special-case reactions.

4. Kid-readable worlds
A child should be able to observe a loop and narrate it:
"The sun heated the water, it turned into steam, the steam made clouds, the clouds rained on the soil, and the plants grew."

5. Surgical evolution
Make the smallest useful changes that increase coherence without destabilizing the existing sandbox.

## World Model
Use one visible pixel grid. Do not introduce multiple detached simulation boards. Instead, let each visible element participate in several lightweight domains.

Each element should have:
- A material identity
- A physical state
- A small set of shared properties
- Optional domain-specific behavior

### Shared Simulation Domains
#### 1. Physics Domain
Shared concepts:
- Solid / powder / liquid / gas
- Density
- Flow tendency
- Buoyancy
- Falling / resting / spreading

This remains the primary visual toy and should stay performant and obvious.

#### 2. Energy Domain
Shared concepts:
- Temperature
- Heat gain/loss
- Heat conductivity
- Heating sources
- Cooling sources
- Phase-change thresholds

This explains fire spread, drying, melting, boiling, condensation, and seasonal-feeling world behavior without adding a true season system yet.

#### 3. Water Domain
Shared concepts:
- Moisture presence
- Evaporation
- Condensation
- Rain
- Infiltration into soil
- Drying from exposure

This is the first major "world loop" because it is visual, intuitive, and connects to plants and terrain immediately.

#### 4. Chemistry Domain
Shared concepts:
- Combustible
- Corrosive
- Reactive with water
- Mineral / organic / fuel-like

Chemistry should stay toy-scale. The main use is to explain fire, acid damage, ash/resin/rock transformations, and a few satisfying material conversions.

#### 5. Biology Domain
Shared concepts:
- Dormant
- Living
- Woody
- Decaying
- Microbial
- Nutrient-dependent
- Moisture-dependent

Biology should emerge from physical and water conditions rather than bypassing them with magic growth.

## Recommended System Order
Build in this order:
1. Physics
2. Energy
3. Water
4. Chemistry
5. Biology

This order matters. Water and biology should depend on heat and movement. Fire and decay should interact with those same foundations.

## First Vertical Slice: The Water Cycle Universe
The first major expansion should be a toy water cycle built on top of the current sandbox.

### Loop
- Sun warms exposed surfaces and liquids
- Water evaporates into steam
- Steam rises and cools
- Steam condenses into cloud or droplets
- Clouds produce rain when cool and saturated enough
- Rain wets soil and refills bodies of water
- Wet soil slowly dries or feeds plant growth

### Why This Slice First
- Easy for a child to understand
- Extremely visual
- Touches existing water, steam, cloud, rain, soil, plant, and fire behaviors
- Creates a living world without needing lots of new elements
- Sets the foundation for ecology, erosion, and weather later

## Sun And Energy Model
The world should gain a simple, always-on sunlight model.

### Sun Rules
- Treat the sun as a global energy source rather than a paintable element in phase 1
- Strongest near the top of the world
- Reduced by depth, shade, clouds, or enclosure if cheaply representable
- Adds heat gradually, not explosively

### Cooling Rules
- Every cell loses some heat over time
- Exposed hot materials cool faster than insulated/wet ones
- This gives the world a natural tendency toward equilibrium

### Toy Energy Balance
Do not try to perfectly conserve energy. Instead:
- Add heat from sun, fire, lava, and local reactions
- Remove heat through passive cooling and evaporation
- Tune the world so heat does not run away forever

The design intent is:
- Water left in sun eventually evaporates
- Steam high in the world cools and condenses
- Hot fires fade unless fed
- Wet worlds feel cooler and calmer

## Element Taxonomy
The element set should be organized into child-readable categories.

### Foundational Elements
- Wall
- Sand
- Water
- Fire
- Lava
- Ice
- Steam
- Cloud
- Rain
- Soil
- Wet Soil
- Seed
- Plant
- Tree
- Bacteria

### Derived Elements
- Branch
- Leaf
- Resin
- Amber
- Smoke
- Ash
- Stone / cooled rock if added
- Mud or sludge if added later

### Category Structure For The UI
- Earth: wall, sand, soil, wet soil, rock
- Water & Sky: water, steam, cloud, rain, ice
- Heat & Fire: fire, lava, cryo, smoke, ash
- Life: seed, plant, tree, bacteria, ant
- Weird / Advanced: acid, nitro, resin, amber, zombie-related or experimental systems

This is primarily a teaching and discoverability win.

## Existing Element Review
### Keep
- Sand, water, fire, lava, ice
- Steam, cloud, rain
- Soil, wet soil
- Seed, plant, tree
- Bacteria

These already support the desired world direction.

### Clarify
- "GERM" should be surfaced as "BACTERIA" or "MICROBE" in kid-facing UI depending on tone
- Plant and Tree need clearer roles

Recommended distinction:
- Plant = soft, fast-growing, short-lived life
- Tree = woody, slow-growing, structural life

### Hide Or De-Prioritize In Main Menu
Elements that are fun but do not help explain the world model should move to an advanced tray or a secondary row, not necessarily be deleted.

This keeps the game readable for Bellamy without removing experimentation for older users.

## UI Direction
The current UI should become easier to scan and more "world-building" oriented without abandoning the table/menu mechanic yet.

### UI Goals
- Faster discovery of what to paint
- More visible grouping of element families
- Better explanation of why reactions happened
- Stronger sense of progression from basic world-building to advanced chaos

### Recommended UI Changes
1. Group the palette into categories
Instead of a flat field of names, visually group by Earth, Water & Sky, Heat & Fire, Life, Advanced.

2. Show simple one-line explanations
Examples:
- Soil: "Holds water for plants"
- Steam: "Hot water that rises"
- Cloud: "Cool steam that can rain"
- Tree: "Woody life that grows upward"

3. Add a "World Ideas" strip
Small suggested experiments for Bellamy:
- Make a rain cloud
- Grow a forest
- Build a volcano
- Flood a valley
- Burn and regrow a biome

4. Add a lightweight "Why?" panel
When a reaction is discovered, show a kid-readable explanation in plain language.

5. Make the world feel slightly less edge-cramped
Adjust viewport sizing and margins so the canvas no longer feels oversized relative to chrome/borders/scrollbars.

## Proposed Interaction Families
The goal is not 50 arbitrary reactions. The goal is 50 candidates that mostly fall out of a few systems.

### Water / Heat / Weather
1. Water + Sun -> Steam
2. Warm Water + Cold Air -> Steam bursts
3. Steam + Cool Upper Air -> Cloud
4. Dense Cloud -> Rain
5. Rain + Soil -> Wet Soil
6. Wet Soil + Sun -> Soil
7. Wet Soil + Plant -> Faster Plant growth
8. Wet Soil + Tree -> Tree growth support
9. Fire + Water -> Steam
10. Lava + Water -> Steam + Rock
11. Ice + Sun -> Water
12. Steam + Cryo -> Ice / frost droplets
13. Cloud + Cold -> Snow-like precipitation later if desired
14. Rain + Lava -> Steam burst and rapid cooling
15. Rain + Fire -> Fire suppression

### Terrain / Earth
16. Sand + Water -> Packed wet sand behavior
17. Soil + Heavy Rain -> Erosion probability
18. Wet Soil + Freeze -> Hard frozen ground
19. Lava + Soil -> Baked soil / sterile ground
20. Ash + Soil -> Fertile soil boost
21. Rock + Water channels -> runoff behavior
22. Soil above cavities + saturation -> collapse/slump chance
23. Wet Soil on slope -> mud-like creep later
24. Sand + Wind/gas flow hint -> drifting
25. Resin burial in soil -> amber over long toy timescale

### Fire / Chemistry
26. Tree + Fire -> Fire spread + smoke + ash
27. Plant + Fire -> Smoke + ash
28. Branch + Fire -> Faster burn than tree trunk
29. Resin + Fire -> Flash burn
30. Bacteria + Dead organics -> decay products
31. Acid + Soil -> damaged fertility / sludge effect
32. Acid + Tree -> resin release
33. Acid + Rock/mineral -> gas or dissolved residue
34. Nitro + Fire -> energetic burst
35. Nitro + Wet Soil -> unstable fertilizer behavior

### Biology / Ecology
36. Seed + Wet Soil -> Fast germination
37. Seed + Soil -> Slow germination
38. Seed + Shallow Water -> Some hydroponic sprouting
39. Plant + Sun + Water -> spread/growth
40. Plant + Shade -> slower growth
41. Tree + Sun + Wet Soil -> trunk and branch growth
42. Tree canopy + shade below -> cooler soil
43. Bacteria + Wet Soil + dead plant matter -> nutrient enrichment
44. Bacteria + too much heat -> die off
45. Bacteria + cold -> slowed spread
46. Plant overcrowding -> thinning or stalled growth
47. Tree + drought -> leaf loss / slowed growth
48. Rain after drought -> regrowth burst
49. Fire-cleared ground + rain + seed -> succession regrowth
50. Ant + seed/plant -> dispersal or consumption behavior

## System Reduction: True Bases
Do not reduce the game to chemical elements like oxygen, hydrogen, and carbon as the primary player-facing objects. That would increase complexity and reduce legibility.

Instead reduce to simulation bases:
- Matter state
- Movement style
- Temperature
- Moisture
- Fuel / corrosion / mineral content
- Living / dormant / decaying status

These are the true bases for this product because they generate many visible outcomes children can understand.

## Domain Layer Model
This project should support multiple science domains, but not as separate detached minigames. They should be layered onto the same world.

### Physical Layer
What moves where and why:
- Falling
- Flowing
- Buoyancy
- Pressure-like spreading
- Phase state

### Energy Layer
Why materials warm, cool, melt, freeze, boil, or burn.

### Water Layer
Why clouds form, rain falls, and soil gets wet.

### Chemistry Layer
Why things ignite, corrode, neutralize, release gas, or leave residue.

### Biology Layer
Why things germinate, grow, decay, spread, and die.

This layered model is the recommended long-term architecture.

## Suggested Phased Roadmap
### Phase 1: Coherence And Cleanup
- Fix viewport edge sizing
- Reorganize element palette into categories
- Improve tooltips/labels for Bellamy readability
- Clarify Plant vs Tree vs Bacteria roles

### Phase 2: Water Cycle
- Global sun heating
- Passive cooling
- Better evaporation
- Better condensation
- Better cloud/rain behavior
- Soil wetting/drying loop

### Phase 3: Ecology
- Plants depend more clearly on light, water, and soil
- Trees become slow woody life
- Bacteria become decay/nutrient agents
- Ash enriches regrowth

### Phase 4: Terrain And Fire Stories
- Lava-water-rock cooling loops
- Soil baking / drought effects
- Fire spread with more coherent smoke/ash aftermath
- Better recovery loops after destruction

### Phase 5: Guided Play
- Experiment prompts
- Why panel
- Discovery chains
- Scenario presets like "Make Rain," "Grow a Forest," "Volcano Valley"

## Design Constraints
- Preserve performance
- Avoid broad refactors unless a new system truly requires them
- Prefer incremental additions over full rewrites
- Keep the current engine legible and hackable
- Favor visible outcomes over hidden simulation values

## Success Criteria
The redesign is succeeding if Bellamy can:
- Make clouds and rain on purpose
- Understand that sunlight drives evaporation
- See soil get wet and later dry
- Grow plants better in the right conditions
- Burn or flood a biome and watch it recover
- Learn patterns through play without reading long instructions

The redesign is not succeeding if:
- The game becomes slower or harder to understand
- The element list grows but the world feels less coherent
- Reactions feel arbitrary again
- Bellamy needs a manual to have fun

## Recommended Overnight Implementation Target
The first autonomous build should not attempt the whole design.

It should target:
- viewport sizing polish
- palette categorization
- kid-facing tooltip cleanup
- a minimal sun/cooling loop
- a first-pass evaporation -> cloud -> rain -> wet soil cycle

That slice is large enough to change the feel of the world and small enough to implement incrementally without destabilizing the sandbox.

## Baseline Assumptions In The Execution Worktree
The dedicated `bellamy-universe` worktree starts from the current tracked `main` branch state, not from the dirty local workspace. That means the implementation baseline is simpler than the exploratory local tree:
- the tracked core files exist: `scripts/canvasConfig.js`, `scripts/game.js`, `scripts/elements.js`, `scripts/menu.js`, `styles.css`, `index.html`
- some untracked experimental files from the local workspace, such as `scripts/tooltips.js`, `scripts/temperature.js`, and other educational additions, are not present in this worktree
- the current tracked palette is still the original flat button grid in `scripts/menu.js`
- the current tracked simulation already has core water, steam, soil, wet soil, plant, tree-adjacent materials, and rock/lava/ice interactions in `scripts/elements.js`

This changes the implementation strategy slightly:
- tooltip cleanup may need to be implemented by creating a small new tooltip/description layer rather than editing an existing tracked tooltip script
- sunlight and water-cycle work should hook into the tracked engine directly instead of assuming prior temperature infrastructure exists
- the current tracked branch remains the correct target because it preserves the reliable falling-sand core and avoids coupling the new milestone to uncommitted experiments

## Sun Update
The overnight implementation should treat `SUN` as an explicit element, not only as a global invisible rule.

Recommended behavior:
- `SUN` is a special hot, anti-gravity, non-falling energy element
- it rises or stays pinned near the top of open space, effectively acting as the opposite of heavy falling materials
- it emits heat into nearby cells
- it helps drive evaporation and the visible water cycle
- it should feel playful and legible to Bellamy rather than astronomically realistic

This is still a toy-universe rule, not a real star simulation. The design intent is to make the source of heat visible and paintable without sacrificing the simple world loop.
