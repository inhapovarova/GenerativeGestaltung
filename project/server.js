const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

const generatedDir = path.join(__dirname, "assets", "generated-buildings");
const DEFAULT_AESTHETIC = "neutral";
const DEFAULT_PALETTE = "originalNeutral";

function ensureGeneratedDir() {
  fs.mkdirSync(generatedDir, { recursive: true });
}

ensureGeneratedDir();

app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

app.use(
  "/generated-buildings",
  express.static(generatedDir)
);

function createArchiveId(createdAt) {
  return `archive_${createdAt.getTime()}`;
}

function createSavedItem(payload = {}) {
  const createdAt = new Date();
  const imageData = payload.imageData;
  const id = payload.id || createArchiveId(createdAt);

  return {
    id,
    type: payload.type === "street" ? "street" : "building",
    createdAt: payload.createdAt || createdAt.toISOString(),
    sourcePage: payload.sourcePage || "unknown",
    aesthetic: payload.aesthetic || DEFAULT_AESTHETIC,
    palette: payload.palette || DEFAULT_PALETTE,
    parameters: payload.parameters || {},
    imageData,
  };
}

function normalizeSavedItem(item, fallback = {}) {
  const source = item || {};
  const imageData = typeof source === "string" ? source : source.imageData;
  const hasSavedFile = Boolean(fallback.path);
  const imageUrl = fallback.imageUrl || fallback.path || source.imageUrl || source.src || null;
  const createdAt = item && typeof item === "object" && item.createdAt
    ? item.createdAt
    : fallback.createdAt || null;
  const id = item && typeof item === "object" && item.id
    ? item.id
    : fallback.id || fallback.filename || "archive_item";

  const normalizedItem = {
    id,
    type: source && source.type === "street" ? "street" : "building",
    createdAt,
    sourcePage: source && source.sourcePage ? source.sourcePage : fallback.sourcePage || "legacy-gallery",
    aesthetic: source && source.aesthetic ? source.aesthetic : DEFAULT_AESTHETIC,
    palette: source && source.palette ? source.palette : DEFAULT_PALETTE,
    parameters: source && source.parameters ? source.parameters : {},
    filename: fallback.filename || `${id}.png`,
    path: fallback.path || null,
    imageUrl,
    src: imageUrl || imageData || null,
  };

  if (!hasSavedFile) {
    normalizedItem.imageData = imageData || null;
  }

  return normalizedItem;
}

function isPngDataUrl(imageData) {
  return typeof imageData === "string" && imageData.startsWith("data:image/png;base64,");
}

function createMetadataItem(savedItem) {
  const { imageData, ...metadataItem } = savedItem;

  return metadataItem;
}

app.post("/api/save-building", (req, res) => {
  try {
    ensureGeneratedDir();
  } catch (error) {
    console.error("Could not create generated-buildings folder:", error);
    return res.status(500).json({ error: "Could not create generated-buildings folder" });
  }

  const savedItem = createSavedItem(req.body);

  if (!savedItem.imageData) {
    return res.status(400).json({ error: "No imageData provided" });
  }

  if (!isPngDataUrl(savedItem.imageData)) {
    return res.status(400).json({ error: "Image data must be a PNG data URL" });
  }

  const base64Data = savedItem.imageData.replace(/^data:image\/png;base64,/, "");
  const filename = `${savedItem.id}.png`;
  const metadataFilename = `${savedItem.id}.json`;
  const filepath = path.join(generatedDir, filename);
  const metadataPath = path.join(generatedDir, metadataFilename);

  fs.writeFile(filepath, base64Data, "base64", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not save file" });
    }

    fs.writeFile(metadataPath, JSON.stringify(createMetadataItem(savedItem), null, 2), "utf8", (metadataErr) => {
      if (metadataErr) {
        console.error(metadataErr);
        return res.status(500).json({ error: "Could not save metadata" });
      }

      res.json({
        ok: true,
        ...normalizeSavedItem(savedItem, {
          filename,
          path: `/assets/generated-buildings/${filename}`,
          imageUrl: `/assets/generated-buildings/${filename}`,
        }),
        metadataFilename,
      });
    });
  });
});

app.get("/api/buildings", (req, res) => {
  try {
    ensureGeneratedDir();
  } catch (error) {
    console.error("Could not create generated-buildings folder:", error);
    return res.status(500).json({ error: "Could not create generated-buildings folder" });
  }

  fs.readdir(generatedDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Could not read folder" });
    }

    const metadataFiles = files.filter((file) => file.toLowerCase().endsWith(".json"));
    const metadataItems = [];
    const metadataImageFiles = new Set();

    for (let file of metadataFiles) {
      try {
        const metadataPath = path.join(generatedDir, file);
        const raw = fs.readFileSync(metadataPath, "utf8");
        const parsed = JSON.parse(raw);
        const pngFilename = `${path.basename(file, ".json")}.png`;

        metadataImageFiles.add(pngFilename);
        metadataItems.push(normalizeSavedItem(parsed, {
          filename: pngFilename,
          path: `/assets/generated-buildings/${pngFilename}`,
          imageUrl: `/assets/generated-buildings/${pngFilename}`,
        }));
      } catch (error) {
        console.error(`Could not read metadata file ${file}:`, error);
      }
    }

    const legacyPngItems = files
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .filter((file) => !metadataImageFiles.has(file))
      .map((file) => normalizeSavedItem({}, {
        id: path.basename(file, ".png"),
        filename: file,
        path: `/assets/generated-buildings/${file}`,
        imageUrl: `/assets/generated-buildings/${file}`,
      }));

    const items = [...metadataItems, ...legacyPngItems].sort((a, b) => {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    res.json(items);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
