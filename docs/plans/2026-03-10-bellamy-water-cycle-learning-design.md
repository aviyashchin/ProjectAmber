# Bellamy Water Cycle Learning Design

## Goal

Design a kid-readable water cycle sandbox for Bellamy that feels fun first, scientifically grounded second, and still respects the fast pixel engine.

## Audience

Bellamy is curious, young, and interested in hacking and how the universe works.

That means the design should:

- reward poking and experimenting
- use short readable names
- make causes visible on screen
- avoid hidden simulation complexity

## Learning Model

The game should teach through visible loops:

`sun -> steam -> cloud -> rain -> water -> wet soil -> plant life`

Each step should be visible with ordinary sandbox play, not only after reading instructions.

## First Principles

### Physics First

Bellamy should be able to learn:

- sand and soil fall
- water flows
- steam rises
- rain falls
- clouds drift

These are motion ideas, not formulas.

### Energy As Tools

Bellamy should learn:

- `SUN` warms and dries
- `CRYO` cools and freezes
- `FIRE` burns
- `LAVA` is hotter and heavier than fire

Energy should appear as local transformation, not an invisible field.

### Biology Depends On Water

Bellamy should see:

- dry soil is less alive
- wet soil supports plant growth
- plants and trees are downstream of water

Biology should not feel magical or disconnected from the world.

## Water Cycle States

The water cycle uses four readable forms of the same substance:

- `WATER`: resting or flowing liquid
- `STEAM`: hot rising water
- `CLOUD`: cool suspended water droplets
- `RAIN`: falling water

This is not strict chemistry. It is a toy state model that helps Bellamy see the cycle.

## Toy Conservation

The world should suggest that water mostly moves between forms rather than being created from nothing.

We do not need exact accounting.

We do need:

- clouds that can rain
- clouds that can thin or warm back into steam
- steam that can cool back into water or cloud
- rain that settles back into water

That gives Bellamy a satisfying “the same stuff keeps changing form” lesson.

## Discovery Model

Discovery should come in two layers.

### Core Discovery

Always visible:

- `SAND`
- `WATER`
- `RAIN`
- `CLOUD`
- `ICE`
- `FIRE`
- `LAVA`
- `SUN`
- `CRYO`
- `SOIL`
- `PLANT`

These are enough to build the basic universe toy.

### Weird Discovery

Still available, but not front-and-center:

- `BLACK HOLE`
- `MYSTERY`
- explosive materials
- acid
- high-chaos toys

These are for “what happens if I do this?” energy, but should not define the default experience.

## UI Learning Pattern

The UI should teach without lecturing.

### Palette

- core materials grouped by domain
- weird toys grouped separately
- similar colors grouped visually

### Info Panel

Each selected element should answer:

- what is it?
- what does it do nearby?

### World Ideas

Prompts should describe experiments, not goals.

Examples:

- “Make Rain”
- “Dry a Swamp”
- “Cool a Volcano”
- “Grow a Forest”

## Border Checkbox

The border checkbox belongs in the “sandbox readability” category, not the simulation category.

Purpose:

- make the playfield easier to read
- help kids understand where the active world begins and ends
- restore a familiar control without affecting performance

## Success Criteria

The water cycle design is successful if:

1. Bellamy can make steam by using `SUN` on water.
2. Bellamy can make clouds without a hidden global system.
3. Bellamy can make rain from clouds.
4. Bellamy can wet soil and grow life from that rain.
5. The game still feels responsive with large scenes.

## Guardrail

If a learning goal requires a heavy simulation layer, change the teaching method rather than the engine.

The lesson should fit the toy, not force the toy to become a weather solver.
