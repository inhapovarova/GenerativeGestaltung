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
        rounded: loadImage("assets/details/balconies/detail_balcony_rounded_01.png"),
        square: loadImage("assets/details/balconies/detail_balcony_square_01.png"),
        tall: loadImage("assets/details/balconies/detail_balcony_tall_01.png"),
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

        const balconyChance = 0.05 + state.memory * 0.22;

        if (random() < balconyChance && assets.details.balconies[windowFamily]) {
          cell.detail = assets.details.balconies[windowFamily];
        }
      }

      rowCells.push(cell);
    }

    cells.push(rowCells);
  }

  placeDoor(cells, widthBlocks, heightBlocks, doorData);

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
    }
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
  return arr[Math.floor(Math.random() * arr.length)];
}
