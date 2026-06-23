const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;

const generatedDir = path.join(__dirname, "assets", "generated-buildings");

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

app.use(
  "/generated-buildings",
  express.static(generatedDir)
);

app.post("/api/save-building", (req, res) => {
  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "No imageData provided" });
  }

  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const filename = `building-${Date.now()}.png`;
  const filepath = path.join(generatedDir, filename);

  fs.writeFile(filepath, base64Data, "base64", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not save file" });
    }

    res.json({
      ok: true,
      filename,
      path: `/generated-buildings/${filename}`,
    });
  });
});

app.get("/api/buildings", (req, res) => {
  fs.readdir(generatedDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Could not read folder" });
    }

    const pngFiles = files
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .map((file) => ({
        filename: file,
        path: `/generated-buildings/${file}`,
      }));

    res.json(pngFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});