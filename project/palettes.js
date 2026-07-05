const COLOR_PALETTES = {
  originalNeutral: {
    name: "Original / Neutral",
    colors: ["#1C1C1C", "#F1EEE8", "#E7E0D3"],
    variations: [
      {
        background: "#F1EEE8",
        headline: "#1C1C1C",
        bodyText: "#1C1C1C",
        secondaryText: "#1C1C1C",
        ground: "#E7E0D3",
        horizon: "#1C1C1C",
        illustration: "#E7E0D3",
        illustrationAlt: "#1C1C1C",
        accent: "#1C1C1C",
      },
      {
        background: "#1C1C1C",
        headline: "#F1EEE8",
        bodyText: "#F1EEE8",
        secondaryText: "#E7E0D3",
        ground: "#E7E0D3",
        horizon: "#F1EEE8",
        illustration: "#E7E0D3",
        illustrationAlt: "#F1EEE8",
        accent: "#F1EEE8",
      },
      {
        background: "#E7E0D3",
        headline: "#1C1C1C",
        bodyText: "#1C1C1C",
        secondaryText: "#1C1C1C",
        ground: "#F1EEE8",
        horizon: "#1C1C1C",
        illustration: "#F1EEE8",
        illustrationAlt: "#1C1C1C",
        accent: "#1C1C1C",
      },
    ],
  },
  mutedBlue: {
    name: "Muted Blue",
    colors: ["#AFC6D8", "#C7D6E2", "#E8E5DE"],
    textColors: ["#5F7180", "#4F5F6A", "#7F9AB1"],
    variations: [
      {
        background: "#E8E5DE",
        headline: "#7F9AB1",
        bodyText: "#5F7180",
        secondaryText: "#4F5F6A",
        ground: "#C7D6E2",
        horizon: "#AFC6D8",
        illustration: "#AFC6D8",
        illustrationAlt: "#C7D6E2",
        accent: "#AFC6D8",
      },
      {
        background: "#AFC6D8",
        headline: "#E8E5DE",
        bodyText: "#4F5F6A",
        secondaryText: "#4F5F6A",
        ground: "#C7D6E2",
        horizon: "#E8E5DE",
        illustration: "#C7D6E2",
        illustrationAlt: "#E8E5DE",
        accent: "#E8E5DE",
      },
      {
        background: "#C7D6E2",
        headline: "#4F5F6A",
        bodyText: "#4F5F6A",
        secondaryText: "#5F7180",
        ground: "#E8E5DE",
        horizon: "#AFC6D8",
        illustration: "#AFC6D8",
        illustrationAlt: "#E8E5DE",
        accent: "#5F7180",
      },
    ],
  },
  monochrome: {
    name: "Monochrome",
    colors: ["#000000", "#FFFFFF"],
    variations: [
      {
        background: "#FFFFFF",
        headline: "#000000",
        bodyText: "#000000",
        secondaryText: "#000000",
        ground: "#FFFFFF",
        horizon: "#000000",
        illustration: "#000000",
        illustrationAlt: "#000000",
        accent: "#000000",
      },
      {
        background: "#000000",
        headline: "#FFFFFF",
        bodyText: "#FFFFFF",
        secondaryText: "#FFFFFF",
        ground: "#000000",
        horizon: "#FFFFFF",
        illustration: "#FFFFFF",
        illustrationAlt: "#FFFFFF",
        accent: "#FFFFFF",
      },
    ],
  },
};

const DEFAULT_PALETTE_ID = "originalNeutral";

function getPalette(paletteId) {
  return COLOR_PALETTES[paletteId] || COLOR_PALETTES[DEFAULT_PALETTE_ID];
}

function shufflePaletteColors(paletteId) {
  const colors = [...getPalette(paletteId).colors];

  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  return colors;
}

function createPaletteAssignment(paletteId) {
  const palette = getPalette(paletteId);
  const variation = pickPaletteArrayItem(palette.variations);
  const assignment = ensureReadableRoles(palette, variation);

  return {
    id: palette === COLOR_PALETTES[paletteId] ? paletteId : DEFAULT_PALETTE_ID,
    name: palette.name,
    colors: palette.colors,
    shuffledColors: shufflePaletteColors(paletteId),
    pageBackground: assignment.background,
    ground: assignment.ground,
    horizon: assignment.horizon,
    headline: assignment.headline,
    bodyText: assignment.bodyText,
    secondaryText: assignment.secondaryText,
    illustration: assignment.illustration,
    illustrationAlt: assignment.illustrationAlt,
    accent: assignment.accent,
    text: assignment.bodyText,
  };
}

function ensureReadableRoles(palette, variation) {
  const readableColors = [...palette.colors, ...(palette.textColors || [])];
  const background = variation.background;

  return {
    ...variation,
    headline: ensureContrast(variation.headline, background, readableColors, 2.4),
    bodyText: ensureContrast(variation.bodyText, background, readableColors, 3),
    secondaryText: ensureContrast(variation.secondaryText, background, readableColors, 3),
    illustration: ensureVisibleColor(variation.illustration, background, palette.colors),
    illustrationAlt: ensureVisibleColor(variation.illustrationAlt, background, palette.colors),
    accent: ensureVisibleColor(variation.accent, background, readableColors),
  };
}

function ensureContrast(colorValue, background, candidates, minimumRatio) {
  if (getContrastRatio(colorValue, background) >= minimumRatio) {
    return colorValue;
  }

  return getHighestContrastColor(background, candidates);
}

function ensureVisibleColor(colorValue, background, candidates) {
  if (
    getColorDistance(colorValue, background) >= 42 &&
    getContrastRatio(colorValue, background) >= 1.25
  ) {
    return colorValue;
  }

  return getHighestContrastColor(background, candidates);
}

function pickPaletteBuildingColor(assignment, warmth) {
  const colors = [assignment.illustration, assignment.illustrationAlt, assignment.accent];
  const index = Math.min(colors.length - 1, Math.floor(warmth * colors.length));
  const chosen = colors[index];

  if (
    getColorDistance(chosen, assignment.pageBackground) < 42 ||
    getContrastRatio(chosen, assignment.pageBackground) < 1.35
  ) {
    return getHighestContrastColor(assignment.pageBackground, colors);
  }

  return chosen;
}

function pickPaletteArrayItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createPaletteSwatchButton(paletteId, palette, onClick) {
  const button = document.createElement("button");
  button.className = "palette-button";
  button.type = "button";
  button.dataset.palette = paletteId;
  button.title = palette.name;
  button.setAttribute("aria-label", palette.name);
  button.addEventListener("click", onClick);

  palette.colors.forEach((colorValue) => {
    const dot = document.createElement("span");
    dot.className = "palette-dot";
    dot.style.background = colorValue;
    button.appendChild(dot);
  });

  return button;
}

// Filter out wrong Hex values and empty strings, then sort by contrast ratio to background color
function getHighestContrastColor(background, colors) {
  const validColors = (colors || []).filter(
    (c) => typeof c === "string" && c.trim().length > 0
  );

  if (!validColors.length) {
    console.warn("getHighestContrastColor: no valid colors given, falling back to #000000");
    return "#000000";
  }

  return [...validColors].sort((a, b) => {
    return getContrastRatio(b, background) - getContrastRatio(a, background);
  })[0];
}

function getContrastRatio(a, b) {
  const light = Math.max(getRelativeLuminance(a), getRelativeLuminance(b));
  const dark = Math.min(getRelativeLuminance(a), getRelativeLuminance(b));

  return (light + 0.05) / (dark + 0.05);
}

function getRelativeLuminance(hexColor) {
  const [r, g, b] = hexToRgb(hexColor).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getColorDistance(a, b) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);

  return Math.sqrt(
    Math.pow(ar - br, 2) +
    Math.pow(ag - bg, 2) +
    Math.pow(ab - bb, 2)
  );
}

// Guards
function hexToRgb(hexColor) {
  if (typeof hexColor !== "string" || hexColor.trim().length === 0) {
    console.warn("hexToRgb received invalid color, falling back to #000000:", hexColor);
    hexColor = "#000000";
  }

  const hex = hexColor.replace("#", "");

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}