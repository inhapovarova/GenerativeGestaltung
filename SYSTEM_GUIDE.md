# The City That Remembers Forward, System Guide

## 1. Project Concept

The City That Remembers Forward is a generative city and exhibition identity system. It explores imaginary buildings, future nostalgia, urban rhythm, memory, tempo, and modular city exploration through p5.js sketches and a small local archive server.

The project currently includes:

- a single building generator
- a random street generator
- a gallery / archive
- a poster generator
- a color palette system
- a saved metadata system
- groundwork for a future marketing content generator

The system is built as static HTML pages plus local JavaScript, served by `project/server.js`.

## 2. Project Pages

### `project/index.html`

Purpose: sandbox / moving city scene.

Main controls: keyboard controls in `project/sketch.js` adjust values such as warmth, density, order, memory, speed, and visible layer count.

What it generates: an animated parallax city with foreground, midground, rear building layers, background images, and asphalt foreground.

How it connects to assets: loads modular building assets from `assets/` and background loops from `assets/backgrounds/`. It does not currently save generated items.

### `project/single-building.html`

Purpose: design and save one transparent building.

Main controls:

- width
- height
- warmth
- decoration
- glow
- order
- memory
- roof toggle
- base toggle
- random
- variation
- save

What it generates: one building made from tile assets: walls, roof parts, base pieces, windows, doors, and balcony details.

How it connects to saved items or assets: `save` creates a transparent PNG data URL and posts it to `/api/save-building`. The server writes a PNG and matching lightweight JSON metadata file in `project/assets/generated-buildings/`.

### `project/random-street.html`

Purpose: generate a moving street row and save the visible row.

Main controls:

- warmth
- decoration
- glow
- order
- memory
- tempo
- random
- save row

What it generates: a horizontally moving row of generated buildings. Buildings touch each other with no gaps in this page.

How it connects to saved items or assets: `save row` captures the visible houses as a transparent PNG and posts a street archive item to `/api/save-building`.

### `project/gallery.html`

Purpose: browse the saved archive.

Main controls:

- View All
- Buildings
- Streets

What it displays: saved building and street images from `/api/buildings`.

How it connects to saved items or assets: loads normalized archive objects from the server. It supports metadata-backed items and older PNG-only items.

### `project/poster-generator.html`

Purpose: generate exhibition posters from saved building or street visuals.

Main controls:

- shuffle
- Neutral / Blue / B/W color scheme switch
- save

What it generates: A4-style exhibition posters using a title, text blocks, date/address text, optional extra text, and one saved building or street visual.

How it connects to saved items or assets: fetches `/api/buildings`, normalizes each item, chooses one image source, and loads it into the poster layout. If no usable archive items exist, it draws fallback building artwork.

## 3. Generator Parameters

### Width

Controls the number of columns in a building.

Current logic: implemented in `single-building.html` as `widthBlocks`. In `random-street.html`, width is chosen automatically per house and can be repeated more often when memory is high.

### Height

Controls the number of floors / rows.

Current logic: implemented in `single-building.html` as `heightBlocks`. In `random-street.html`, height is chosen automatically per house and can be repeated more often when memory is high.

### Warmth

Controls the tint of buildings.

Low warmth feels colder. High warmth feels warmer.

Current logic: `chooseBuildingTint()` blends between cold and warm colors. Warmth should not control window amount or decoration amount.

### Decoration

Controls the amount of decorative elements.

At `0`, buildings feel empty and plain. At `1`, there should be more details such as plants, lamps, cracks, curtains, balconies, wires, or ornaments.

Current logic: decoration mainly affects balcony/detail chance and top accent window chance. Plants, lamps, cracks, curtains, wires, and ornaments are intended future asset categories; only balcony detail PNGs are currently loaded by the generators.

### Glow

Controls the amount of glowing windows.

At `0`, no windows should glow. At `1`, many windows should glow.

Current logic: implemented in `single-building.html` and `random-street.html` through `chooseWindowState(state)`.

### Order

Controls regularity of window placement.

At `0`, placement may be more irregular. At `1`, placement follows a stricter grid.

Current logic: order chooses between patterns such as `scattered`, `checker`, `sparse`, `everySecond`, `regular`, `centerColumn`, and `edgeColumns`.

### Memory

Controls repetition.

At `0`, the generator uses more variation. At `1`, elements repeat more often.

Current logic:

- single building: can repeat window state and detail choice.
- random street: can repeat width, height, roof family, wall family, window family, and wall block across houses.
- sandbox city: affects shape, color, and repetition decisions.

### Tempo

Used for movement, animation, or parallax speed.

Current logic: implemented in `random-street.html` as scroll speed through `tempoToSpeed()`.

Tempo should not affect building shape.

### Density

Current logic: used in `project/sketch.js` for the sandbox city. It affects city spacing and building dimensions there, but it is not exposed in the single building or random street UI.

## 4. Saved Item Metadata

Saved buildings and streets should be stored as structured archive objects, not only as raw images.

Example:

```js
{
  id: "archive_042",
  type: "building",
  createdAt: "2026-06-23T19:30:00.000Z",
  sourcePage: "single-building",
  aesthetic: "neutral",
  palette: "originalNeutral",
  parameters: {
    width: 4,
    height: 6,
    warmth: 0.5,
    decoration: 0.3,
    glow: 0.6,
    order: 0.45,
    memory: 0.7
  },
  imageUrl: "/assets/generated-buildings/archive_042.png"
}
```

Fields:

- `id`: unique archive id. The server currently creates ids like `archive_<timestamp>`.
- `type`: `building` or `street`.
- `createdAt`: ISO timestamp for sorting and future filtering.
- `sourcePage`: where the item was created, such as `single-building` or `random-street`.
- `aesthetic`: current value is usually `neutral`; future values may include `gothic`, `grunge`, or `cute`.
- `palette`: palette id or label used when saving. Current generator saves may use `default`, `originalNeutral`, `mutedBlue`, or `monochrome` depending on source and project state.
- `parameters`: saved generator settings, such as width, height, warmth, decoration, glow, order, memory, tempo, speed, and building count.
- `imageUrl`: path to the saved PNG file. New metadata-backed items should prefer this.
- `imageData`: PNG data URL. This is accepted for saving and backward compatibility, but should not be kept in JSON metadata when a PNG file exists.

Current server behavior:

- `POST /api/save-building` accepts `imageData`.
- The server writes `<id>.png`.
- The server writes `<id>.json` without the base64 image data.
- `GET /api/buildings` returns normalized items with `imageUrl`, `path`, and `src`.

Rules:

- Metadata JSON files should stay lightweight.
- Base64 image data should not be stored inside metadata JSON if a PNG file exists.
- Frontend code should use a normalization/helper function and read `imageUrl`, `src`, `path`, or `imageData` in that order of preference.

## 5. Gallery / Archive Logic

The gallery displays saved archive items from `/api/buildings`.

Saved items can be:

- buildings
- streets
- older PNG-only items without metadata

Current filters:

- View All
- Buildings
- Streets

Old saved items without metadata should still appear in View All. Because their `type` may be unknown, they may not appear under Buildings or Streets unless the server can infer or normalize the type.

Future filters may include:

- posters
- palettes
- aesthetics
- dates

## 6. Color Palette System

The palette system is not only a background switch. It assigns colors to visual roles.

Current palette source: `project/palettes.js`.

Current poster UI labels:

- Neutral
- Blue
- B/W

### Original Neutral

Colors:

- black
- off-white
- milky / cream

### Muted Blue

Colors:

- muted blue
- dusty blue-grey
- pale warm grey

### Monochrome

Colors:

- black
- white

Conceptually, monochrome can include grey variants in future, but the current poster behavior uses pure black and white so the B/W mode can render a clear silhouette poster.

Visual roles:

- background
- headline
- body text
- metadata text / secondary text
- generated building or street visual
- accent elements

Rules:

- Colors should stay inside the selected palette.
- Text must remain readable.
- Small functional text must not use a color too close to the background.
- Clicking an inactive palette selects that palette.
- Clicking the active palette reshuffles role assignments while keeping the same poster layout and image.
- Some variations may invert contrast, for example black background with white text.
- Role assignment should be constrained, not fully random.

Current poster behavior:

- Neutral and Blue recolor the same poster using role assignments.
- B/W uses the transparent PNG shape as a solid silhouette.
- Re-clicking B/W can invert black/white.
- `shuffle` creates a new poster composition while keeping the current color scheme.

## 7. Asset System

Current asset structure:

```txt
project/assets/
  backgrounds/
    asphalt_loop.png
    bg_far_static.png
    bg_mid_loop.png
  base/
    plain/
  details/
    balconies/
    lamps/
    plants/
  doors/
    double/
    single/
  generated-buildings/
  roofs/
    cornice/
    flat/
  walls/
    brick/
    smooth/
  windows/
    rounded/
    square/
    tall/
```

Current loaded asset families:

- walls: `smooth`, `brick`
- windows: `square`, `tall`, `rounded`
- doors: `single`, `double`
- roofs: `flat`, `cornice`
- base: `plain`
- details: `balconies`

The `details/lamps/` and `details/plants/` folders exist, but the current generator preload code only loads balcony detail assets.

Intended future structure for aesthetic categories:

```txt
assets/
  buildings/
    walls/
      neutral/
      gothic/
      grunge/
      cute/
    windows/
      neutral/
      gothic/
      grunge/
      cute/
    doors/
      neutral/
      gothic/
      grunge/
      cute/
    roofs/
      neutral/
      gothic/
      grunge/
      cute/
    details/
      neutral/
      gothic/
      grunge/
      cute/
```

Recommended naming conventions:

```txt
window_gothic_arched_01.png
door_grunge_metal_01.png
roof_cute_round_01.png
detail_gothic_lamp_01.png
wall_neutral_plaster_01.png
```

Asset rules:

- Assets should be modular.
- Assets should fit the `64 x 64` block grid unless a specific renderer documents a different size.
- Assets should work with transparent backgrounds when needed.
- New aesthetic assets should be placed in the correct folder or tagged clearly in the filename.
- If an aesthetic asset is missing, the generator should fall back to neutral assets.
- Keep asset names lowercase and descriptive.

## 8. Poster / Marketing Generator

The poster generator currently creates exhibition posters.

Current poster content:

- title
- intro text
- poem-like text
- date and address
- extra information
- generated building or street visual

Current poster controls:

- `shuffle`: chooses a new saved building/street visual and a new layout.
- `Neutral / Blue / B/W`: changes the color scheme. Re-clicking the active scheme reshuffles color role assignments.
- `save`: exports the visible poster PNG.

Current poster format:

- `1240 x 1754`, matching an A4 ratio.

Current behavior:

- Loads archive items from `/api/buildings`.
- Uses saved image URLs when available.
- Falls back to generated placeholder artwork if no saved archive item can be loaded.
- Avoids placing text directly over the image block when possible.
- Uses B/W silhouette rendering for the monochrome poster.

Future goal: evolve this into a marketing content generator.

Planned formats:

- A4 poster
- Instagram 4:5 post, `1080 x 1350`
- square post, `1080 x 1080`
- story format, `1080 x 1920`

Intended future controls:

- layout selection
- editable title
- editable subtitle
- editable date
- editable location
- image source: random building or random street
- palette selection

## 9. Development Workflow

Recommended branch workflow:

```bash
git checkout main
git pull --rebase origin main
git checkout -b issue-number-short-description
```

Example:

```bash
git checkout -b 11-instagram-post-layout
```

Before committing:

```bash
git status
git diff
npm run build
```

Important: `project/package.json` currently does not define a real `build` script. Check `package.json` before running or documenting build commands for a task. For this project today, manual browser testing is required.

Commit example:

```bash
git add .
git commit -m "feat(generator): add instagram post layout"
git push -u origin branch-name
```

Notes:

- One issue should usually have one branch.
- Avoid changing unrelated files.
- Test manually in the browser.
- Keep visual style consistent.
- Write clear PR descriptions.
- Link PRs to issues with `Closes #issueNumber`.

## 10. Contribution Guidelines

- Keep the visual language minimal, soft, editorial, and archive-like.
- Do not add random bright colors outside the selected palette system.
- Use enough negative space.
- Do not stretch images; crop or scale them correctly.
- Keep typography bold and simple.
- Make sure text remains readable.
- Keep metadata lightweight.
- Do not store large base64 image data in JSON metadata files.
- Keep old saved items backward compatible where possible.
- Add comments when implementing future logic that is not fully finished.
- Do not mix unrelated feature changes into the same commit or pull request.

## 11. Open Next Steps

Possible future improvements:

- gallery filters for buildings and streets
- poster archive support
- Instagram 4:5 layout
- square and story layouts
- editable text fields
- image source selector: building or street
- aesthetic selector: neutral / gothic / grunge / cute
- decoration density logic beyond balconies
- glow window logic refinements
- asset guide for classmates
- social media content generator
- improved export settings
- neutral fallbacks for missing aesthetic assets
- cleanup of `.DS_Store` files from the project tree

