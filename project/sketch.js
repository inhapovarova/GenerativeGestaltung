const BLOCK = 64;
const TILE_OVERLAP = 2;

let assets = {};
let houses = [];

let groundY;
let scrollSpeed = 0.8;

const baselineState = {
  warmth: 0.5,
  density: 0.5,
  order: 0.45,
  memory: 0.45,
};

let currentState = { ...baselineState };

function preload() {
  assets = {
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
  noSmooth();

  groundY = height - BLOCK * 1.2;

  initializeCity();
}

function draw() {
  drawBackground();

  updateCity();
  drawCity();

  drawDebugState();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height - BLOCK * 1.2;
  houses = [];
  initializeCity();
}

function initializeCity() {
  houses = [];

  let x = -BLOCK * 2;

  while (x < width + BLOCK * 4) {
    const house = generateHouse(x, currentState);
    houses.push(house);
    x += house.widthBlocks * BLOCK + randomGap(currentState);
  }
}

function updateCity() {
  for (let house of houses) {
    house.x -= scrollSpeed;
  }

  houses = houses.filter((house) => {
    return house.x + house.widthBlocks * BLOCK > -BLOCK * 2;
  });

  let rightEdge = getRightEdge();

  while (rightEdge < width + BLOCK * 4) {
    const gap = randomGap(currentState);
    const newHouse = generateHouse(rightEdge + gap, currentState);
    houses.push(newHouse);
    rightEdge = getRightEdge();
  }
}

function getRightEdge() {
  if (houses.length === 0) return 0;

  let maxEdge = 0;

  for (let house of houses) {
    const edge = house.x + house.widthBlocks * BLOCK;
    if (edge > maxEdge) maxEdge = edge;
  }

  return maxEdge;
}

function drawCity() {
  for (let house of houses) {
    drawHouse(house);
  }
}

function generateHouse(x, state) {
  const widthBlocks = chooseWidth(state);
  const heightBlocks = chooseHeight(state);

    
  const roofFamily = pick(Object.keys(assets.roofs));
    
  const wallFamily = pick(Object.keys(assets.walls));
    
  const windowFamily = pick(Object.keys(assets.windows));

  
    
  // one exact wall block for the whole building
    
  const wallBlock = pick(assets.walls[wallFamily]);

  
    
  // one exact base block for the whole building
    
  const baseBlock = pick(assets.base.plain);

  
    
  const doorData = chooseDoor(widthBlocks, state);
    
  const windowPattern = chooseWindowPattern(state);
    
  const windowColumns = getWindowColumns(widthBlocks, windowPattern);

  
    
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

      if (isGroundRow) {
        cell.base = baseBlock;
      }

      if (isMiddleRow && windowColumns.includes(col)) {
        const litChance = 0.18 + state.warmth * 0.25 + state.memory * 0.2;
        const windowState = random() < litChance ? "lit" : "dark";
        cell.window = assets.windows[windowFamily][windowState];

        const balconyChance = 0.05 + state.memory * 0.22;

        if (random() < balconyChance) {
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
    y: groundY,
    widthBlocks,
    heightBlocks,
    roofFamily,
    wallFamily,
    windowFamily,
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

function drawHouse(house) {
  const houseDrawX = Math.round(house.x);

  const bodyTopY = Math.round(house.y - house.heightBlocks * BLOCK);
  const roofY = bodyTopY - BLOCK;

  drawRoof(house, roofY, houseDrawX);

  for (let row = 0; row < house.heightBlocks; row++) {
    for (let col = 0; col < house.widthBlocks; col++) {
      const x = houseDrawX + col * BLOCK;
      const y = bodyTopY + row * BLOCK;
      const cell = house.cells[row][col];

      // Main wall tile, slightly overlapping
      drawTintedTile(cell.wall, x, y, house.tintColor, 210);

      // Base overlay, also slightly overlapping
      if (cell.base) {
        drawTile(cell.base, x, y);
      }

      // Windows, doors, and details stay exact size
      if (cell.window) {
        image(cell.window, x, y, BLOCK, BLOCK);
      }

      if (cell.door) {
        image(cell.door, x, y, BLOCK, BLOCK);
      }

      if (cell.detail) {
        image(cell.detail, x, y, BLOCK, BLOCK);
      }
    }
  }
}

function drawRoof(house, roofY, houseDrawX) {
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

    drawTile(roofPart, x, roofY);
  }
}

function drawTile(img, x, y) {
  image(
    img,
    x - TILE_OVERLAP / 2,
    y - TILE_OVERLAP / 2,
    BLOCK + TILE_OVERLAP,
    BLOCK + TILE_OVERLAP
  );
}

function drawTintedTile(img, x, y, tintColor, alpha = 255) {
  push();
  tint(tintColor[0], tintColor[1], tintColor[2], alpha);

  image(
    img,
    x - TILE_OVERLAP / 2,
    y - TILE_OVERLAP / 2,
    BLOCK + TILE_OVERLAP,
    BLOCK + TILE_OVERLAP
  );

  pop();
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

function chooseWindowPattern(state) {
  if (state.order > 0.65) {
    return pick(["regular", "everySecond"]);
  }

  if (state.memory > 0.6) {
    return pick(["centered", "everySecond", "sparse"]);
  }

  return pick(["regular", "everySecond", "centered"]);
}

function getWindowColumns(widthBlocks, pattern) {
  const cols = [];

  if (pattern === "regular") {
    for (let c = 0; c < widthBlocks; c++) {
      cols.push(c);
    }
  }

  if (pattern === "everySecond") {
    const offset = widthBlocks % 2 === 0 ? 0 : 1;

    for (let c = 0; c < widthBlocks; c++) {
      if (c % 2 === offset) {
        cols.push(c);
      }
    }

    if (cols.length === 0) {
      cols.push(floor(widthBlocks / 2));
    }
  }

  if (pattern === "centered") {
    if (widthBlocks <= 2) {
      cols.push(0, 1);
    } else if (widthBlocks % 2 === 0) {
      cols.push(widthBlocks / 2 - 1, widthBlocks / 2);
    } else {
      cols.push(floor(widthBlocks / 2));
    }
  }

  if (pattern === "sparse") {
    const count = widthBlocks >= 4 ? 2 : 1;

    while (cols.length < count) {
      const c = floor(random(widthBlocks));
      if (!cols.includes(c)) {
        cols.push(c);
      }
    }

    cols.sort((a, b) => a - b);
  }

  return cols;
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

function pick(arr) {
  return arr[floor(random(arr.length))];
}

function drawBackground() {
  background(224, 225, 220);

  noStroke();

  fill(205, 210, 215, 120);
  rect(0, groundY - BLOCK * 8, width, BLOCK * 8);

  fill(190, 190, 185);
  rect(0, groundY, width, height - groundY);

  fill(170, 170, 165);
  rect(0, groundY, width, 2);
}

function drawDebugState() {
  fill(20, 90);
  noStroke();
  rect(16, 16, 210, 82, 8);

  fill(255);
  textSize(12);
  text(`warmth: ${currentState.warmth.toFixed(2)}`, 28, 38);
  text(`density: ${currentState.density.toFixed(2)}`, 28, 56);
  text(`order: ${currentState.order.toFixed(2)}`, 28, 74);
  text(`memory: ${currentState.memory.toFixed(2)}`, 28, 92);
}

function keyPressed() {
  if (key === "1") {
    currentState.warmth = constrain(currentState.warmth - 0.1, 0, 1);
  }

  if (key === "2") {
    currentState.warmth = constrain(currentState.warmth + 0.1, 0, 1);
  }

  if (key === "3") {
    currentState.density = constrain(currentState.density - 0.1, 0, 1);
  }

  if (key === "4") {
    currentState.density = constrain(currentState.density + 0.1, 0, 1);
  }

  if (key === "5") {
    currentState.order = constrain(currentState.order - 0.1, 0, 1);
  }

  if (key === "6") {
    currentState.order = constrain(currentState.order + 0.1, 0, 1);
  }

  if (key === "7") {
    currentState.memory = constrain(currentState.memory - 0.1, 0, 1);
  }

  if (key === "8") {
    currentState.memory = constrain(currentState.memory + 0.1, 0, 1);
  }

  if (key === "r" || key === "R") {
    houses = [];
    initializeCity();
  }

  if (key === "s" || key === "S") {
    saveCanvas("generated_city", "png");
  }
}