const BLOCK = 64;
const TILE_OVERLAP = 2;

let assets = {};
let foregroundLayer;
let midgroundLayer;
let rearBuildingLayer;
let atmosphericBuffer;
let visibleBuildingLayerCount = 3;

let groundY;

// main city speed
let scrollSpeed = 1.6;

// background layer offsets
let midBgOffset = 0;
let asphaltOffset = 0;

// parallax speed for the middle background
const MID_BG_SPEED_FACTOR = 0.22;
const MIDGROUND_HEIGHT_MULTIPLIER = 1.18;
const MIDGROUND_SPEED_MULTIPLIER = 0.65;
const MIDGROUND_TINT = [150, 190, 230, 82];
const MIDGROUND_OPACITY = 1;
const MIDGROUND_BACKING_ALPHA = 255;
const MIDGROUND_GAP_MULTIPLIER = 0.72;
const MIDGROUND_X_OFFSET = BLOCK * 1.6;
const MIDGROUND_GROUND_OFFSET = BLOCK * 0.08;
const REAR_BUILDING_HEIGHT_MULTIPLIER = 0.86;
const REAR_BUILDING_SPEED_MULTIPLIER = 0.42;
const REAR_BUILDING_TINT = [150, 190, 230, 132];
const REAR_BUILDING_OPACITY = 1;
const REAR_BUILDING_BACKING_ALPHA = 255;
const REAR_BUILDING_GAP_MULTIPLIER = 0.58;
const REAR_BUILDING_X_OFFSET = BLOCK * 3.1;
const REAR_BUILDING_GROUND_OFFSET = BLOCK * 0.02;
const MIN_BUILDING_LAYER_COUNT = 1;
const MAX_BUILDING_LAYER_COUNT = 3;

const baselineState = {
  warmth: 0.5,
  density: 0.5,
  order: 0.45,
  memory: 0.45,
};

let currentState = { ...baselineState };

function preload() {
  assets = {
    backgrounds: {
      far: loadImage("assets/backgrounds/bg_far_static.png"),
      mid: loadImage("assets/backgrounds/bg_mid_loop.png"),
      asphalt: loadImage("assets/backgrounds/asphalt_loop.png"),
    },

    base: {
      plain: [
        loadImage("assets/base/plain/base_plain_01.png"),
        loadImage("assets/base/plain/base_plain_02.png"),
      ],
    },

    roofs: {
      flat: {
        left: loadImage("assets/roofs/flat/roof_flat_left.png"),
        mid: loadImage("assets/roofs/flat/roof_flat_mid.png"),
        right: loadImage("assets/roofs/flat/roof_flat_right.png"),
      },
      cornice: {
        left: loadImage("assets/roofs/cornice/roof_cornice_left.png"),
        mid: loadImage("assets/roofs/cornice/roof_cornice_mid.png"),
        right: loadImage("assets/roofs/cornice/roof_cornice_right.png"),
      },
    },

    roofRailings: {
      flat: loadImage("assets/roofs/railings/roof_railing.png"),
    },

    walls: {
      smooth: [
        loadImage("assets/walls/smooth/wall_smooth_01.png"),
        loadImage("assets/walls/smooth/wall_smooth_02.png"),
      ],
      brick: [
        loadImage("assets/walls/brick/wall_brick_01.png"),
        loadImage("assets/walls/brick/wall_brick_02.png"),
      ],
    },

    windows: {
      square: {
        dark: loadImage("assets/windows/square/window_square_dark.png"),
        lit: loadImage("assets/windows/square/window_square_lit.png"),
      },
      tall: {
        dark: loadImage("assets/windows/tall/window_tall_dark.png"),
        lit: loadImage("assets/windows/tall/window_tall_lit.png"),
      },
      rounded: {
        dark: loadImage("assets/windows/rounded/window_rounded_dark.png"),
        lit: loadImage("assets/windows/rounded/window_rounded_lit.png"),
      },
    },

    doors: {
      single: {
        rect: loadImage("assets/doors/single/door_single_rect.png"),
        arch: loadImage("assets/doors/single/door_single_arch.png"),
      },
      double: {
        rect: {
          left: loadImage("assets/doors/double/door_double_rect_left.png"),
          right: loadImage("assets/doors/double/door_double_rect_right.png"),
        },
      },
    },

    details: {
      balconies: {
        single: [
          loadImage("assets/details/balconies/detail_balcony_single.png"),
          loadImage("assets/details/balconies/detail_balcony_rounded_01.png"),
          loadImage("assets/details/balconies/detail_balcony_square_01.png"),
          loadImage("assets/details/balconies/detail_balcony_tall_01.png"),
        ],
        double: [
          {
            parts: [
              loadImage("assets/details/balconies/detail_balcony_double_01_left.png"),
              loadImage("assets/details/balconies/detail_balcony_double_01_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/details/balconies/detail_balcony_double_02_left.png"),
              loadImage("assets/details/balconies/detail_balcony_double_02_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/details/balconies/detail_balcony_double_03_left.png"),
              loadImage("assets/details/balconies/detail_balcony_double_03_right.png"),
            ],
          },
        ],
      },
    },

    decor: {
      plants: {
        roof: [
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_vine_01_top.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_01_upper.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_01_lower.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_01_bottom.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_vine_02_top.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_02_mid.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_02_bottom.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_vine_03_top.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_03_bottom.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_vine_04_top.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_04_bottom.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_vine_05_top.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_05_mid.png"),
              loadImage("assets/decor/plants/roof/plant_roof_vine_05_bottom.png"),
            ],
          },
        ],
        roofTop: [
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_01.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_02.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_03.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_04.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_05.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_06.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_07.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_08.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_09.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_long_01_left.png"),
              loadImage("assets/decor/plants/roof/plant_roof_top_long_01_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_long_02_left.png"),
              loadImage("assets/decor/plants/roof/plant_roof_top_long_02_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_long_03_left.png"),
              loadImage("assets/decor/plants/roof/plant_roof_top_long_03_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_long_04_left.png"),
              loadImage("assets/decor/plants/roof/plant_roof_top_long_04_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/roof/plant_roof_top_long_05_left.png"),
              loadImage("assets/decor/plants/roof/plant_roof_top_long_05_right.png"),
            ],
          },
        ],
        ground: [
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_pot_01.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_pot_02.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_pot_03.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_pot_04.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_bush_01_left.png"),
              loadImage("assets/decor/plants/ground/plant_ground_bush_01_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/plants/ground/plant_ground_bush_02_left.png"),
              loadImage("assets/decor/plants/ground/plant_ground_bush_02_right.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_01_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_01_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_02_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_02_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_03_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_03_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_04_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_04_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_05_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_05_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_06_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_06_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_07_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_07_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_08_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_08_bottom.png"),
            ],
          },
          {
            layout: "vertical",
            parts: [
              loadImage("assets/decor/plants/ground/tree_ground_tall_09_top.png"),
              loadImage("assets/decor/plants/ground/tree_ground_tall_09_bottom.png"),
            ],
          },
        ],
        wall: [
          loadImage("assets/decor/plants/wall/plant_wall_climber_01.png"),
          loadImage("assets/decor/plants/wall/plant_wall_climber_02.png"),
        ],
      },
      balconies: [
        loadImage("assets/decor/balconies/balcony_window_flower_01.png"),
        loadImage("assets/decor/balconies/balcony_window_flower_02.png"),
      ],
      appliances: {
        ac: [
          loadImage("assets/decor/appliances/ac_wall_01.png"),
          loadImage("assets/decor/appliances/ac_wall_02.png"),
        ],
      },
      stairs: [
        loadImage("assets/decor/stairs/stair_fire_escape_01.png"),
      ],
      posters: {
        ground: [
          loadImage("assets/decor/posters/ground/poster_ground_small_01.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_02.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_03.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_04.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_05.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_06.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_07.png"),
          loadImage("assets/decor/posters/ground/poster_ground_small_09.png"),
        ],
        upper: [
          {
            type: "vertical",
            parts: [
              loadImage("assets/decor/posters/upper/poster_upper_tall_02_top.png"),
              loadImage("assets/decor/posters/upper/poster_upper_tall_02_bottom.png"),
            ],
          },
          {
            type: "vertical",
            parts: [
              loadImage("assets/decor/posters/upper/poster_upper_tall_03_top.png"),
              loadImage("assets/decor/posters/upper/poster_upper_tall_03_bottom.png"),
            ],
          },
          {
            type: "vertical",
            parts: [
              loadImage("assets/decor/posters/upper/poster_upper_tall_04_top.png"),
              loadImage("assets/decor/posters/upper/poster_upper_tall_04_bottom.png"),
            ],
          },
          {
            type: "rect",
            rows: [
              [
                loadImage("assets/decor/posters/upper/poster_upper_large_01_top_left.png"),
                loadImage("assets/decor/posters/upper/poster_upper_large_01_top_right.png"),
              ],
              [
                loadImage("assets/decor/posters/upper/poster_upper_large_01_bottom_left.png"),
                loadImage("assets/decor/posters/upper/poster_upper_large_01_bottom_right.png"),
              ],
            ],
          },
        ],
      },
      street: [
        loadImage("assets/decor/street/street_bench_01.png"),
        loadImage("assets/decor/street/street_bench_02.png"),
        loadImage("assets/decor/street/street_bike_01.png"),
        loadImage("assets/decor/street/street_bin_01.png"),
        loadImage("assets/decor/street/street_bin_02.png"),
        loadImage("assets/decor/street/street_bin_03.png"),
      ],
      spans: {
        roof: [
          {
            parts: [
              loadImage("assets/decor/spans/span_between_lights_01_left.png"),
              loadImage("assets/decor/spans/span_between_lights_01_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/spans/span_between_flags_01_left.png"),
              loadImage("assets/decor/spans/span_between_flags_01_right.png"),
            ],
          },
          {
            parts: [
              loadImage("assets/decor/spans/span_between_lights_01_01.png"),
              loadImage("assets/decor/spans/span_between_lights_01_02.png"),
              loadImage("assets/decor/spans/span_between_lights_01_03.png"),
              loadImage("assets/decor/spans/span_between_lights_01_04.png"),
              loadImage("assets/decor/spans/span_between_lights_01_05.png"),
            ],
          },
        ],
        laundry: [
          loadImage("assets/decor/spans/span_between_laundry_01.png"),
        ],
        house: [
          {
            mode: "tile",
            parts: [
              loadImage("assets/decor/spans/span_house_lights_01_left.png"),
              loadImage("assets/decor/spans/span_house_lights_01_right.png"),
            ],
          },
          {
            mode: "tile",
            parts: [
              loadImage("assets/decor/spans/span_house_lights_02_left.png"),
              loadImage("assets/decor/spans/span_house_lights_02_right.png"),
            ],
          },
          {
            mode: "tile",
            parts: [
              loadImage("assets/decor/spans/span_house_lights_03_left.png"),
              loadImage("assets/decor/spans/span_house_lights_03_right.png"),
            ],
          },
          {
            mode: "tile",
            parts: [
              loadImage("assets/decor/spans/span_house_flags_01.png"),
            ],
          },
          {
            mode: "tile",
            parts: [
              loadImage("assets/decor/spans/span_house_flags_02.png"),
            ],
          },
        ],
      },
    },
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  imageMode(CORNER);

  // If the image becomes too pixelated, remove this line.
  noSmooth();

  groundY = height - BLOCK * 1.2;
  atmosphericBuffer = createBuildingLayerBuffer();

  initializeCity();
}

function draw() {
  updateLayerOffsets();

  drawBackgroundLayers();

  updateCity();
  if (visibleBuildingLayerCount >= 3) {
    drawBuildingLayer(rearBuildingLayer);
  }

  if (visibleBuildingLayerCount >= 2) {
    drawBuildingLayer(midgroundLayer);
  }

  drawBuildingLayer(foregroundLayer);

  drawAsphaltForeground();

  drawDebugState();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height - BLOCK * 1.2;

  midBgOffset = 0;
  asphaltOffset = 0;
  atmosphericBuffer = createBuildingLayerBuffer();

  initializeCity();
}

// -----------------------------
// BACKGROUND LAYERS
// -----------------------------

function updateLayerOffsets() {
  midBgOffset = (midBgOffset + scrollSpeed * MID_BG_SPEED_FACTOR) % assets.backgrounds.mid.width;
  asphaltOffset = (asphaltOffset + scrollSpeed) % assets.backgrounds.asphalt.width;
}

function drawBackgroundLayers() {
  background(224, 225, 220);

  drawFarBackground();
  drawMidBackground();
}

function drawFarBackground() {
  const img = assets.backgrounds.far;

  image(img, 0, 0, width, height);
}

function drawMidBackground() {
  const img = assets.backgrounds.mid;

  const layerHeight = height * 0.65;
  const y = groundY - layerHeight;

  drawTiledImage(
    img,
    -midBgOffset,
    y,
    img.width,
    layerHeight
  );
}

function drawAsphaltForeground() {
  const img = assets.backgrounds.asphalt;

  const asphaltHeight = height - groundY + BLOCK * 0.35;
  const y = groundY - BLOCK * 0.05;

  drawTiledImage(
    img,
    -asphaltOffset,
    y,
    img.width,
    asphaltHeight
  );
}

function drawTiledImage(img, startX, y, tileWidth, tileHeight) {
  let x = startX;

  while (x > 0) {
    x -= tileWidth;
  }

  while (x < width) {
    image(img, Math.round(x), Math.round(y), tileWidth, tileHeight);
    x += tileWidth;
  }
}

// -----------------------------
// CITY MANAGEMENT
// -----------------------------

function initializeCity() {
  foregroundLayer = createBuildingLayer({
    speedMultiplier: 1,
  });

  midgroundLayer = createBuildingLayer({
    heightMultiplier: MIDGROUND_HEIGHT_MULTIPLIER,
    speedMultiplier: MIDGROUND_SPEED_MULTIPLIER,
    tint: MIDGROUND_TINT,
    opacity: MIDGROUND_OPACITY,
    backingAlpha: MIDGROUND_BACKING_ALPHA,
    gapMultiplier: MIDGROUND_GAP_MULTIPLIER,
    xOffset: MIDGROUND_X_OFFSET,
    groundOffset: MIDGROUND_GROUND_OFFSET,
  });

  rearBuildingLayer = createBuildingLayer({
    heightMultiplier: REAR_BUILDING_HEIGHT_MULTIPLIER,
    speedMultiplier: REAR_BUILDING_SPEED_MULTIPLIER,
    tint: REAR_BUILDING_TINT,
    opacity: REAR_BUILDING_OPACITY,
    backingAlpha: REAR_BUILDING_BACKING_ALPHA,
    gapMultiplier: REAR_BUILDING_GAP_MULTIPLIER,
    xOffset: REAR_BUILDING_X_OFFSET,
    groundOffset: REAR_BUILDING_GROUND_OFFSET,
  });
}

function createBuildingLayer(options = {}) {
  const layer = {
    houses: [],
    heightMultiplier: options.heightMultiplier || 1,
    speedMultiplier: options.speedMultiplier || 1,
    tint: options.tint || null,
    opacity: options.opacity === undefined ? 1 : options.opacity,
    backingAlpha: options.backingAlpha || 0,
    gapMultiplier: options.gapMultiplier || 1,
    xOffset: options.xOffset || 0,
    groundOffset: options.groundOffset || 0,
  };

  let x = -BLOCK * 2 - layer.xOffset;

  while (x < width + BLOCK * 4) {
    const house = generateHouse(x, currentState, layer);
    layer.houses.push(house);
    x += house.widthBlocks * BLOCK + randomGap(currentState) * layer.gapMultiplier;
  }

  return layer;
}

function updateCity() {
  updateBuildingLayer(rearBuildingLayer);
  updateBuildingLayer(midgroundLayer);
  updateBuildingLayer(foregroundLayer);
}

function updateBuildingLayer(layer) {
  if (!layer) return;

  for (let house of layer.houses) {
    house.x -= scrollSpeed * layer.speedMultiplier;
  }

  layer.houses = layer.houses.filter((house) => {
    return house.x + house.widthBlocks * BLOCK > -BLOCK * 2;
  });

  let rightEdge = getRightEdge(layer);

  while (rightEdge < width + BLOCK * 4) {
    const gap = randomGap(currentState) * layer.gapMultiplier;
    const newHouse = generateHouse(rightEdge + gap, currentState, layer);
    layer.houses.push(newHouse);
    rightEdge = getRightEdge(layer);
  }
}

function getRightEdge(layer) {
  if (!layer || layer.houses.length === 0) return 0;

  let maxEdge = 0;

  for (let house of layer.houses) {
    const edge = house.x + house.widthBlocks * BLOCK;
    if (edge > maxEdge) maxEdge = edge;
  }

  return maxEdge;
}

function drawBuildingLayer(layer) {
  if (!layer) return;

  if (layer.tint) {
    drawTintedBuildingLayer(layer);
    return;
  }

  for (let house of layer.houses) {
    drawHouse(house, null, layer);
  }
}

function drawTintedBuildingLayer(layer) {
  if (!atmosphericBuffer) return;

  atmosphericBuffer.clear();

  for (let house of layer.houses) {
    drawHouse(house, atmosphericBuffer, layer);
  }

  const ctx = atmosphericBuffer.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  atmosphericBuffer.noStroke();
  atmosphericBuffer.fill(layer.tint[0], layer.tint[1], layer.tint[2], layer.tint[3]);
  atmosphericBuffer.rect(0, 0, width, height);
  ctx.restore();

  push();
  tint(255, 255 * layer.opacity);
  image(atmosphericBuffer, 0, 0);
  pop();
}

function createBuildingLayerBuffer() {
  const buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  buffer.imageMode(CORNER);
  buffer.noSmooth();

  return buffer;
}

// -----------------------------
// HOUSE GENERATION
// -----------------------------

function generateHouse(x, state, layer = {}) {
  const widthBlocks = chooseWidth(state);
  const heightMultiplier = layer.heightMultiplier || 1;
  const heightBlocks = max(3, ceil(chooseHeight(state) * heightMultiplier));

  const hasRoof = chooseHasRoof(state);
  const roofFamily = hasRoof ? pick(Object.keys(assets.roofs)) : null;

  const wallFamily = pick(Object.keys(assets.walls));
  const windowFamily = pick(Object.keys(assets.windows));

  const topAccentWindow = chooseTopAccentWindow(
    widthBlocks,
    hasRoof,
    state,
    windowFamily
  );

  // one exact wall block for the whole building
  const wallBlock = pick(assets.walls[wallFamily]);

  const hasBase = chooseHasBase(state);
  const baseBlock = hasBase ? pick(assets.base.plain) : null;

  const doorData = chooseDoor(widthBlocks, state);
  const windowPattern = chooseWindowPattern(widthBlocks, state);

  const tintColor = chooseBuildingTint(state);

  const cells = [];

  for (let row = 0; row < heightBlocks; row++) {
    const rowCells = [];

    for (let col = 0; col < widthBlocks; col++) {
      const cell = {
        wall: wallBlock,
        base: null,
        window: null,
        door: null,
        detail: null,
        decorBack: null,
        decorFront: null,
        decorFrontOffsetY: 0,
        decorFrontWidth: BLOCK,
        decorFrontHeight: BLOCK,
      };

      const isGroundRow = row === heightBlocks - 1;
      const isMiddleRow = row > 0 && row < heightBlocks - 1;
      const isTopRow = row === 0;

      if (isGroundRow && baseBlock) {
        cell.base = baseBlock;
      }

      if (
        isTopRow &&
        topAccentWindow &&
        col === topAccentWindow.col
      ) {
        const accentFamily = topAccentWindow.family;
        const windowState = random() < 0.45 ? "lit" : "dark";

        cell.window = assets.windows[accentFamily][windowState];
        cell.detail = null;
      }

      if (
        isMiddleRow &&
        shouldPlaceWindow(row, col, heightBlocks, widthBlocks, windowPattern)
      ) {
        const litChance = 0.18 + state.warmth * 0.25 + state.memory * 0.2;
        const windowState = random() < litChance ? "lit" : "dark";

        cell.window = assets.windows[windowFamily][windowState];

      }

      rowCells.push(cell);
    }

    cells.push(rowCells);
  }

  placeDoor(cells, widthBlocks, heightBlocks, doorData);
  placeWindowBalconyDetails(cells, widthBlocks, heightBlocks, state, layer);
  placeStairDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeRoofPlantDecor(cells, widthBlocks, heightBlocks, state, hasRoof, layer);
  placeGroundPlantDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeStreetDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeBalconyDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeWallPlantDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeLaundrySpanDecor(cells, widthBlocks, heightBlocks, state, layer);
  placeAirConditionerDecor(cells, widthBlocks, heightBlocks, state, layer);
  placePosterDecor(cells, widthBlocks, heightBlocks, state, layer);
  const spans = chooseHouseSpanDecor(widthBlocks, heightBlocks, state, hasRoof, layer);
  const roofTopDecor = chooseRoofTopPlantDecor(widthBlocks, state, hasRoof, layer);

  return {
    x,
    y: groundY + (layer.groundOffset || 0),
    widthBlocks,
    heightBlocks,
    hasRoof,
    roofFamily,
    wallFamily,
    windowFamily,
    wallBlock,
    hasBase,
    baseBlock,
    windowPattern,
    topAccentWindow,
    tintColor,
    spans,
    roofTopDecor,
    cells,
  };
}

function placeDoor(cells, widthBlocks, heightBlocks, doorData) {
  const groundRow = heightBlocks - 1;

  if (doorData.width === 2 && widthBlocks >= 4) {
    const startCol = floor((widthBlocks - 2) / 2);

    cells[groundRow][startCol].door = doorData.asset.left;
    cells[groundRow][startCol + 1].door = doorData.asset.right;

    return;
  }

  const doorCol = floor(widthBlocks / 2);
  cells[groundRow][doorCol].door = doorData.asset;
}

function placeWindowBalconyDetails(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const balconies = assets.details && assets.details.balconies;
  if (!balconies) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const doubleBalconies = balconies.double || [];
  const singleBalconies = balconies.single || [];
  const doubleChance = lerp(0, 0.34, decoration);
  const singleChance = lerp(0.08, 0.46, decoration);

  for (let row = 1; row < heightBlocks - 1; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      if (
        doubleBalconies.length > 0 &&
        col + 1 < widthBlocks &&
        random() < doubleChance &&
        canPlaceDoubleWindowBalcony(cells, row, col)
      ) {
        const balcony = pick(doubleBalconies);
        cells[row][col].detail = balcony.parts[0];
        cells[row][col + 1].detail = balcony.parts[1];
        col++;
        continue;
      }

      if (
        singleBalconies.length > 0 &&
        random() < singleChance &&
        canPlaceSingleWindowBalcony(cells, row, col)
      ) {
        cells[row][col].detail = pick(singleBalconies);
      }
    }
  }
}

function canPlaceSingleWindowBalcony(cells, row, col) {
  const cell = cells[row][col];

  return Boolean(
    cell &&
    cell.window &&
    !cell.detail &&
    !cell.decorFront
  );
}

function canPlaceDoubleWindowBalcony(cells, row, col) {
  return (
    canPlaceSingleWindowBalcony(cells, row, col) &&
    canPlaceSingleWindowBalcony(cells, row, col + 1)
  );
}

function placeRoofPlantDecor(cells, widthBlocks, heightBlocks, state, hasRoof, layer = {}) {
  if (!hasRoof) return;
  if (heightBlocks < 2) return;
  if (layer.tint) return;

  const roofPlants = assets.decor && assets.decor.plants && assets.decor.plants.roof;
  if (!roofPlants || roofPlants.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const chance = lerp(0, 0.72, decoration);
  const candidates = [];
  let placedCount = 0;

  for (let col = 0; col < widthBlocks; col++) {
    const freeLength = countOpenVerticalCells(cells, 0, col);
    const fittingVines = roofPlants.filter((vine) => vine.parts.length <= freeLength);

    if (fittingVines.length === 0) continue;

    candidates.push({ col, fittingVines });
    if (random() > chance) continue;

    const vine = pick(fittingVines);
    placeVerticalDecor(cells, 0, col, vine.parts);
    placedCount++;
  }

  if (placedCount === 0 && decoration > 0.35 && candidates.length > 0) {
    const candidate = pick(candidates);
    const vine = pick(candidate.fittingVines);
    placeVerticalDecor(cells, 0, candidate.col, vine.parts);
  }
}

function chooseRoofTopPlantDecor(widthBlocks, state, hasRoof, layer = {}) {
  if (hasRoof) return [];
  if (layer.tint) return [];

  const roofTopPlants = assets.decor && assets.decor.plants && assets.decor.plants.roofTop;
  if (!roofTopPlants || roofTopPlants.length === 0) return [];

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return [];

  const chance = lerp(0, 0.26, decoration);
  const placements = [];

  for (let col = 0; col < widthBlocks; col++) {
    if (random() > chance) continue;

    const fittingPlants = roofTopPlants.filter((plant) => col + plant.parts.length <= widthBlocks);
    if (fittingPlants.length === 0) continue;

    const plant = pick(fittingPlants);
    placements.push({
      col,
      parts: plant.parts,
    });

    col += plant.parts.length - 1;
  }

  return placements;
}

function placeGroundPlantDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;

  const groundPlants = assets.decor && assets.decor.plants && assets.decor.plants.ground;
  if (!groundPlants || groundPlants.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const groundRow = heightBlocks - 1;
  const chance = lerp(0, 0.55, decoration);

  for (let col = 0; col < widthBlocks; col++) {
    if (random() > chance) continue;

    const plant = pick(groundPlants);

    if (plant.layout === "vertical") {
      const startRow = groundRow - plant.parts.length + 1;
      if (!canPlaceVerticalDecor(cells, startRow, col, plant.parts.length)) continue;

      placeVerticalDecor(cells, startRow, col, plant.parts);
      continue;
    }

    if (!canPlaceHorizontalDecor(cells, groundRow, col, plant.parts.length)) continue;

    placeHorizontalDecor(cells, groundRow, col, plant.parts);
  }
}

function canPlaceHorizontalDecor(cells, row, startCol, length) {
  if (startCol + length > cells[row].length) return false;

  for (let i = 0; i < length; i++) {
    if (!isOpenWallCell(cells[row][startCol + i])) {
      return false;
    }
  }

  return true;
}

function placeHorizontalDecor(cells, row, startCol, parts) {
  for (let i = 0; i < parts.length; i++) {
    cells[row][startCol + i].decorFront = parts[i];
  }
}

function canPlaceVerticalDecor(cells, startRow, col, length) {
  if (startRow < 0) return false;
  if (startRow + length > cells.length) return false;

  for (let i = 0; i < length; i++) {
    if (!isOpenWallCell(cells[startRow + i][col])) {
      return false;
    }
  }

  return true;
}

function placeStreetDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;

  const streetProps = assets.decor && assets.decor.street;
  if (!streetProps || streetProps.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const groundRow = heightBlocks - 1;
  const chance = lerp(0.12, 0.78, decoration);
  const candidates = [];
  let placedCount = 0;

  for (let col = 0; col < widthBlocks; col++) {
    const cell = cells[groundRow][col];

    if (!isOpenWallCell(cell)) continue;
    candidates.push(col);
    if (random() > chance) continue;

    cell.decorFront = pick(streetProps);
    placedCount++;
  }

  const minimumCount = decoration > 0.55 ? 3 : decoration > 0.2 ? 2 : 1;

  while (placedCount < minimumCount && candidates.length > 0) {
    const candidateIndex = floor(random(candidates.length));
    const col = candidates.splice(candidateIndex, 1)[0];
    const cell = cells[groundRow][col];

    if (!isOpenWallCell(cell)) continue;

    cell.decorFront = pick(streetProps);
    placedCount++;
  }
}

function placeBalconyDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const balconies = assets.decor && assets.decor.balconies;
  if (!balconies || balconies.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const chance = lerp(0, 0.32, decoration);

  for (let row = 1; row < heightBlocks - 1; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      const cell = cells[row][col];

      if (!cell.window) continue;
      if (cell.detail || cell.decorFront) continue;
      if (random() > chance) continue;

      cell.decorFront = pick(balconies);
    }
  }
}

function placeWallPlantDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const wallPlants = assets.decor && assets.decor.plants && assets.decor.plants.wall;
  if (!wallPlants || wallPlants.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const chance = lerp(0, 0.26, decoration);

  for (let row = 1; row < heightBlocks - 1; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      const cell = cells[row][col];

      if (!cell.window) continue;
      if (cell.detail || cell.decorFront) continue;
      if (row + 1 < heightBlocks && cells[row + 1][col].decorFront) continue;
      if (random() > chance) continue;

      cell.decorFront = pick(wallPlants);
      cell.decorFrontOffsetY = BLOCK * 0.38;
    }
  }
}

function placeLaundrySpanDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const laundrySpans = assets.decor && assets.decor.spans && assets.decor.spans.laundry;
  if (!laundrySpans || laundrySpans.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const chance = lerp(0, 0.18, decoration);

  for (let row = 1; row < heightBlocks - 1; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      const cell = cells[row][col];

      if (!cell.window) continue;
      if (cell.detail || cell.decorFront) continue;
      if (!hasRoomForWindowSpan(cells, row, col)) continue;
      if (random() > chance) continue;

      cell.decorFront = pick(laundrySpans);
      cell.decorFrontWidth = BLOCK * 2;
      cell.decorFrontHeight = BLOCK * 2;
      cell.decorFrontOffsetY = BLOCK * 0.12;
    }
  }
}

function hasRoomForWindowSpan(cells, row, col) {
  const widthBlocks = cells[row].length;
  const heightBlocks = cells.length;

  if (col + 1 >= widthBlocks) return false;
  if (row + 1 >= heightBlocks) return false;

  return (
    !cells[row][col + 1].door &&
    !cells[row][col + 1].detail &&
    !cells[row][col + 1].decorFront &&
    !cells[row + 1][col].door &&
    !cells[row + 1][col].detail &&
    !cells[row + 1][col].decorFront
  );
}

function placeAirConditionerDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const acUnits = assets.decor && assets.decor.appliances && assets.decor.appliances.ac;
  if (!acUnits || acUnits.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  const chance = lerp(0, 0.22, decoration);

  for (let row = 1; row < heightBlocks - 1; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      const cell = cells[row][col];

      if (!cell.window) continue;
      if (random() > chance) continue;

      const sideCols = random() < 0.5 ? [col - 1, col + 1] : [col + 1, col - 1];

      for (let sideCol of sideCols) {
        if (sideCol < 0 || sideCol >= widthBlocks) continue;
        if (!isOpenWallCell(cells[row][sideCol])) continue;

        cells[row][sideCol].decorFront = pick(acUnits);
        break;
      }
    }
  }
}

function placeStairDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const stairs = assets.decor && assets.decor.stairs;
  if (!stairs || stairs.length === 0) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;
  if (random() > lerp(0, 0.36, decoration)) return;

  const stair = pick(stairs);
  const maxLength = min(5, heightBlocks - 1);
  if (maxLength <= 0) return;

  const length = floor(random(1, maxLength + 1));
  const startRow = heightBlocks - length;
  const candidates = [];

  for (let col = 0; col < widthBlocks; col++) {
    if (canPlaceVerticalDecor(cells, startRow, col, length)) {
      candidates.push(col);
    }
  }

  if (candidates.length === 0) return;

  const col = pick(candidates);

  for (let row = startRow; row < heightBlocks; row++) {
    cells[row][col].decorFront = stair;
  }
}

function chooseHouseSpanDecor(widthBlocks, heightBlocks, state, hasRoof, layer = {}) {
  if (layer.tint) return [];
  if (widthBlocks < 3) return [];
  if (heightBlocks < 3) return [];

  const spans = assets.decor && assets.decor.spans;
  if (!spans) return [];

  const roofSpans = hasRoof ? spans.roof : [];
  const houseSpans = spans.house || [];
  const availableSpans = [...(roofSpans || []), ...houseSpans];
  if (availableSpans.length === 0) return [];

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return [];
  if (random() > lerp(0.24, 0.78, decoration)) return [];

  const spanCount = decoration > 0.65 && heightBlocks >= 5 && random() < 0.55 ? 2 : 1;
  const spansToPlace = [];
  const usedRows = [];
  const maxRow = min(heightBlocks - 2, 4);

  for (let i = 0; i < spanCount; i++) {
    const candidates = [];

    for (let row = 0; row <= maxRow; row++) {
      if (!usedRows.includes(row)) {
        candidates.push(row);
      }
    }

    if (candidates.length === 0) break;

    const row = pick(candidates);
    usedRows.push(row);

    spansToPlace.push({
      asset: pick(availableSpans),
      offsetY: row * BLOCK + BLOCK * 0.15,
      height: BLOCK * 2,
    });
  }

  return spansToPlace;
}

function placePosterDecor(cells, widthBlocks, heightBlocks, state, layer = {}) {
  if (layer.tint) return;
  if (heightBlocks < 3) return;

  const posters = assets.decor && assets.decor.posters;
  if (!posters) return;

  const decoration = getDecorationAmount(state);
  if (decoration <= 0) return;

  placeGroundPosterDecor(cells, widthBlocks, heightBlocks, posters.ground, decoration);
  placeUpperPosterDecor(cells, widthBlocks, heightBlocks, posters.upper, decoration);
}

function placeGroundPosterDecor(cells, widthBlocks, heightBlocks, groundPosters, decoration) {
  if (!groundPosters || groundPosters.length === 0) return;

  const chance = lerp(0, 0.32, decoration);
  const rowStart = max(1, heightBlocks - 2);

  for (let row = rowStart; row < heightBlocks; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      const cell = cells[row][col];

      if (!isOpenWallCell(cell)) continue;
      if (random() > chance) continue;

      cell.decorBack = pick(groundPosters);
    }
  }
}

function placeUpperPosterDecor(cells, widthBlocks, heightBlocks, upperPosters, decoration) {
  if (!upperPosters || upperPosters.length === 0) return;

  const chance = lerp(0, 0.22, decoration);
  const maxStartRow = max(1, heightBlocks - 3);

  for (let row = 1; row <= maxStartRow; row++) {
    for (let col = 0; col < widthBlocks; col++) {
      if (random() > chance) continue;

      const fittingPosters = upperPosters.filter((poster) => {
        if (poster.type === "vertical") {
          return canPlaceVerticalBackDecor(cells, row, col, poster.parts.length);
        }

        if (!isWithinMaxFloor(row, heightBlocks, 3)) {
          return false;
        }

        return canPlaceRectBackDecor(cells, row, col, poster.rows);
      });

      if (fittingPosters.length === 0) continue;

      const poster = pick(fittingPosters);

      if (poster.type === "vertical") {
        placeVerticalBackDecor(cells, row, col, poster.parts);
      } else {
        placeRectBackDecor(cells, row, col, poster.rows);
      }
    }
  }
}

function isWithinMaxFloor(row, heightBlocks, maxFloor) {
  const floorFromGround = heightBlocks - row;
  return floorFromGround <= maxFloor;
}

function canPlaceVerticalBackDecor(cells, startRow, col, length) {
  if (startRow + length > cells.length) return false;

  for (let i = 0; i < length; i++) {
    if (!isOpenWallCell(cells[startRow + i][col])) {
      return false;
    }
  }

  return true;
}

function placeVerticalBackDecor(cells, startRow, col, parts) {
  for (let i = 0; i < parts.length; i++) {
    cells[startRow + i][col].decorBack = parts[i];
  }
}

function canPlaceRectBackDecor(cells, startRow, startCol, rows) {
  const rectHeight = rows.length;
  const rectWidth = rows[0].length;

  if (startRow + rectHeight > cells.length) return false;
  if (startCol + rectWidth > cells[0].length) return false;

  for (let row = 0; row < rectHeight; row++) {
    for (let col = 0; col < rectWidth; col++) {
      if (!isOpenWallCell(cells[startRow + row][startCol + col])) {
        return false;
      }
    }
  }

  return true;
}

function placeRectBackDecor(cells, startRow, startCol, rows) {
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      cells[startRow + row][startCol + col].decorBack = rows[row][col];
    }
  }
}

function countOpenVerticalCells(cells, startRow, col) {
  let count = 0;

  for (let row = startRow; row < cells.length; row++) {
    if (!isOpenWallCell(cells[row][col])) {
      break;
    }

    count++;
  }

  return count;
}

function placeVerticalDecor(cells, startRow, col, parts) {
  for (let i = 0; i < parts.length; i++) {
    cells[startRow + i][col].decorFront = parts[i];
  }
}

function isOpenWallCell(cell) {
  return (
    !cell.window &&
    !cell.door &&
    !cell.detail &&
    !cell.decorBack &&
    !cell.decorFront
  );
}

function getDecorationAmount(state) {
  if (state.decoration !== undefined) {
    return constrain(state.decoration, 0, 1);
  }

  return constrain(state.memory, 0, 1);
}

// -----------------------------
// HOUSE RULES
// -----------------------------

function chooseHasRoof(state) {
  const roofChance = 0.7 - state.density * 0.15 + state.memory * 0.1;
  return random() < roofChance;
}

function chooseHasBase(state) {
  const baseChance = 0.65 + state.order * 0.1;
  return random() < baseChance;
}

function chooseWidth(state) {
  let minW = 2;
  let maxW = 5;

  if (state.density > 0.65) {
    maxW = 6;
  }

  if (state.order > 0.7) {
    return pick([3, 4]);
  }

  return floor(random(minW, maxW + 1));
}

function chooseHeight(state) {
  let minH = floor(lerp(3, 5, state.density));
  let maxH = floor(lerp(5, 9, state.density));

  let h = floor(random(minH, maxH + 1));

  if (state.memory > 0.7 && random() < 0.35) {
    h = max(3, h - 1);
  }

  return h;
}

function chooseDoor(widthBlocks, state) {
  const canUseDouble = widthBlocks >= 4;
  const doubleChance = canUseDouble ? 0.25 + state.order * 0.15 : 0;

  if (random() < doubleChance) {
    return {
      width: 2,
      asset: assets.doors.double.rect,
    };
  }

  const singleType = random() < 0.5 ? "rect" : "arch";

  return {
    width: 1,
    asset: assets.doors.single[singleType],
  };
}

function chooseWindowPattern(widthBlocks, state) {
  let patterns = [];

  patterns.push("regular");
  patterns.push("centerColumn");

  if (widthBlocks >= 3) {
    patterns.push("edgeColumns");
  }

  patterns.push("everySecond");

  if (widthBlocks >= 3) {
    patterns.push("checker");
  }

  if (state.memory > 0.55) {
    patterns.push("checker");
    patterns.push("sparse");
  }

  if (state.order > 0.7) {
    patterns = ["regular", "centerColumn"];

    if (widthBlocks >= 3) {
      patterns.push("edgeColumns");
    }
  }

  return pick(patterns);
}

function shouldPlaceWindow(row, col, heightBlocks, widthBlocks, pattern) {
  const bodyRowIndex = row - 1;

  if (pattern === "regular") {
    return true;
  }

  if (pattern === "centerColumn") {
    if (widthBlocks === 2) {
      return col === 0 || col === 1;
    }

    return col === floor(widthBlocks / 2);
  }

  if (pattern === "edgeColumns") {
    if (widthBlocks <= 2) {
      return true;
    }

    if (widthBlocks === 3) {
      return col === 0 || col === 2;
    }

    return col === 1 || col === widthBlocks - 2;
  }

  if (pattern === "everySecond") {
    if (widthBlocks <= 2) {
      return col === 0;
    }

    return col % 2 === 0;
  }

  if (pattern === "checker") {
    if (widthBlocks < 3) {
      return col % 2 === 0;
    }

    return (col + bodyRowIndex) % 2 === 0;
  }

  if (pattern === "sparse") {
    if (widthBlocks <= 2) {
      return col === floor(widthBlocks / 2);
    }

    if (widthBlocks === 3) {
      return col === 1;
    }

    return col === 1 || col === widthBlocks - 2;
  }

  return false;
}

function chooseTopAccentWindow(widthBlocks, hasRoof, state, mainWindowFamily) {
  if (!hasRoof) return null;
  if (widthBlocks < 3) return null;
  if (widthBlocks % 2 === 0) return null;

  const accentChance = 0.18 + state.memory * 0.25 - state.order * 0.08;

  if (random() > accentChance) {
    return null;
  }

  return {
    col: floor(widthBlocks / 2),
    family: chooseDifferentWindowFamily(mainWindowFamily),
  };
}

function chooseDifferentWindowFamily(mainWindowFamily) {
  const families = Object.keys(assets.windows).filter((family) => {
    return family !== mainWindowFamily;
  });

  return pick(families);
}

function randomGap(state) {
  const minGap = lerp(BLOCK * 0.25, 0, state.density);
  const maxGap = lerp(BLOCK * 1.2, BLOCK * 0.25, state.density);

  return random(minGap, maxGap);
}

function chooseBuildingTint(state) {
  const cold = color(150, 165, 180);
  const warm = color(220, 178, 145);
  const pastel = color(205, 180, 200);

  let base = lerpColor(cold, warm, state.warmth);

  if (random() < state.memory * 0.45) {
    base = lerpColor(base, pastel, 0.35);
  }

  const variation = lerp(22, 8, state.order);

  return [
    red(base) + random(-variation, variation),
    green(base) + random(-variation, variation),
    blue(base) + random(-variation, variation),
  ];
}

// -----------------------------
// DRAWING HOUSES
// -----------------------------

function drawHouse(house, target = null, layer = null) {
  const houseDrawX = Math.round(house.x);

  const bodyTopY = Math.round(house.y - house.heightBlocks * BLOCK);
  const roofY = bodyTopY - BLOCK;

  if (layer && layer.backingAlpha > 0) {
    drawHouseBacking(house, houseDrawX, bodyTopY, layer.backingAlpha, target);
  }

  if (house.hasRoof) {
    drawRoof(house, roofY, houseDrawX, target);
  }

  for (let row = 0; row < house.heightBlocks; row++) {
    for (let col = 0; col < house.widthBlocks; col++) {
      const x = houseDrawX + col * BLOCK;
      const y = bodyTopY + row * BLOCK;
      const cell = house.cells[row][col];

      drawTintedTile(cell.wall, x, y, house.tintColor, 255, target);

      if (cell.decorBack) {
        drawImage(cell.decorBack, x, y, BLOCK, BLOCK, target);
      }

      if (cell.base) {
        drawTile(cell.base, x, y, target);
      }

      if (cell.window) {
        drawImage(cell.window, x, y, BLOCK, BLOCK, target);
      }

      if (cell.door) {
        drawImage(cell.door, x, y, BLOCK, BLOCK, target);
      }

      if (cell.detail) {
        drawImage(cell.detail, x, y, BLOCK, BLOCK, target);
      }

      if (cell.decorFront) {
        drawImage(
          cell.decorFront,
          x,
          y + cell.decorFrontOffsetY,
          cell.decorFrontWidth,
          cell.decorFrontHeight,
          target
        );
      }
    }
  }

  drawHouseSpans(house, houseDrawX, bodyTopY, target);
  drawRoofTopDecor(house, roofY, bodyTopY, houseDrawX, target);
  drawFlatRoofRailing(house, bodyTopY, houseDrawX, target);
}

function drawRoofTopDecor(house, roofY, bodyTopY, houseDrawX, target = null) {
  if (!house.roofTopDecor || house.roofTopDecor.length === 0) return;

  const drawY = house.hasRoof ? roofY : bodyTopY - BLOCK;

  for (let decor of house.roofTopDecor) {
    for (let i = 0; i < decor.parts.length; i++) {
      drawImage(
        decor.parts[i],
        houseDrawX + (decor.col + i) * BLOCK,
        drawY,
        BLOCK,
        BLOCK,
        target
      );
    }
  }
}

function drawFlatRoofRailing(house, bodyTopY, houseDrawX, target = null) {
  if (house.hasRoof) return;
  if (!house.roofTopDecor || house.roofTopDecor.length === 0) return;
  if (!assets.roofRailings || !assets.roofRailings.flat) return;

  const y = bodyTopY - BLOCK;

  for (let col = 0; col < house.widthBlocks; col++) {
    drawImage(
      assets.roofRailings.flat,
      houseDrawX + col * BLOCK,
      y,
      BLOCK,
      BLOCK,
      target
    );
  }
}

function drawHouseSpans(house, houseDrawX, bodyTopY, target = null) {
  if (!house.spans || house.spans.length === 0) return;

  for (let span of house.spans) {
    const x = houseDrawX;
    const y = bodyTopY + span.offsetY;
    const totalWidth = house.widthBlocks * BLOCK;

    if (span.asset.mode === "tile") {
      drawTiledSpanParts(span.asset.parts, x, y, totalWidth, span.height, target);
    } else {
      drawSpanParts(span.asset.parts, x, y, totalWidth, span.height, target);
    }
  }
}

function drawTiledSpanParts(parts, x, y, totalWidth, height, target = null) {
  if (!parts || parts.length === 0) return;

  const count = ceil(totalWidth / BLOCK);

  for (let i = 0; i < count; i++) {
    drawImage(parts[i % parts.length], x + i * BLOCK, y, BLOCK, height, target);
  }
}

function drawSpanParts(parts, x, y, totalWidth, height, target = null) {
  if (!parts || parts.length === 0) return;

  const partWidth = totalWidth / parts.length;

  for (let i = 0; i < parts.length; i++) {
    drawImage(parts[i], x + i * partWidth, y, partWidth, height, target);
  }
}

function drawHouseBacking(house, houseDrawX, bodyTopY, alpha, target = null) {
  const renderer = target || window;
  const backingWidth = house.widthBlocks * BLOCK;

  renderer.push();
  renderer.noStroke();
  renderer.fill(house.tintColor[0], house.tintColor[1], house.tintColor[2], alpha);
  renderer.rect(houseDrawX, bodyTopY, backingWidth, house.heightBlocks * BLOCK);

  renderer.pop();
}

function drawRoof(house, roofY, houseDrawX, target = null) {
  if (!house.hasRoof || !house.roofFamily) return;

  const roof = assets.roofs[house.roofFamily];

  for (let col = 0; col < house.widthBlocks; col++) {
    const x = houseDrawX + col * BLOCK;

    let roofPart;

    if (col === 0) {
      roofPart = roof.left;
    } else if (col === house.widthBlocks - 1) {
      roofPart = roof.right;
    } else {
      roofPart = roof.mid;
    }

    drawTile(roofPart, x, roofY, target);
  }
}

function drawTile(img, x, y, target = null) {
  drawImage(
    img,
    x - TILE_OVERLAP / 2,
    y - TILE_OVERLAP / 2,
    BLOCK + TILE_OVERLAP,
    BLOCK + TILE_OVERLAP,
    target
  );
}

function drawTintedTile(img, x, y, tintColor, alpha = 255, target = null) {
  const renderer = target || window;

  renderer.push();
  renderer.tint(tintColor[0], tintColor[1], tintColor[2], alpha);

  drawImage(
    img,
    x - TILE_OVERLAP / 2,
    y - TILE_OVERLAP / 2,
    BLOCK + TILE_OVERLAP,
    BLOCK + TILE_OVERLAP,
    target
  );

  renderer.pop();
}

function drawImage(img, x, y, w, h, target = null) {
  if (target) {
    target.image(img, x, y, w, h);
    return;
  }

  image(img, x, y, w, h);
}

// -----------------------------
// DEBUG AND CONTROLS
// -----------------------------

function drawDebugState() {
  fill(20, 90);
  noStroke();
  rect(16, 16, 230, 120, 8);

  fill(255);
  textSize(12);
  text(`warmth: ${currentState.warmth.toFixed(2)}`, 28, 38);
  text(`density: ${currentState.density.toFixed(2)}`, 28, 56);
  text(`order: ${currentState.order.toFixed(2)}`, 28, 74);
  text(`memory: ${currentState.memory.toFixed(2)}`, 28, 92);
  text(`speed: ${scrollSpeed.toFixed(1)}`, 28, 110);
  text(`layers: ${visibleBuildingLayerCount}`, 28, 128);
}

function keyPressed() {
  let shouldRegenerateCity = false;

  if (key === "1") {
    currentState.warmth = constrain(currentState.warmth - 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "2") {
    currentState.warmth = constrain(currentState.warmth + 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "3") {
    currentState.density = constrain(currentState.density - 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "4") {
    currentState.density = constrain(currentState.density + 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "5") {
    currentState.order = constrain(currentState.order - 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "6") {
    currentState.order = constrain(currentState.order + 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "7") {
    currentState.memory = constrain(currentState.memory - 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "8") {
    currentState.memory = constrain(currentState.memory + 0.1, 0, 1);
    shouldRegenerateCity = true;
  }

  if (key === "9") {
    visibleBuildingLayerCount = max(
      MIN_BUILDING_LAYER_COUNT,
      visibleBuildingLayerCount - 1
    );
  }

  if (key === "0") {
    visibleBuildingLayerCount = min(
      MAX_BUILDING_LAYER_COUNT,
      visibleBuildingLayerCount + 1
    );
  }

  if (key === "-") {
    scrollSpeed = max(0.2, scrollSpeed - 0.2);
  }

  if (key === "=" || key === "+") {
    scrollSpeed = min(5.0, scrollSpeed + 0.2);
  }

  if (key === "r" || key === "R") {
    shouldRegenerateCity = true;
  }

  if (key === "s" || key === "S") {
    saveCanvas("generated_city", "png");
  }

  if (shouldRegenerateCity) {
    initializeCity();
  }
}

function pick(arr) {
  return arr[floor(random(arr.length))];
}
