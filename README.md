# Generative Gestaltung

Collaborative course project with small p5.js generators for modular city/building visuals.\

<img width="965" height="587" alt="Screenshot 2026-06-26 at 02 02 06" src="https://github.com/user-attachments/assets/4aa5aef3-4698-44ae-9641-041f6e44f812" />

## What is inside

- `project/index.html` - sandbox / main street generator
- `project/single-building.html` - single building generator
- `project/poster-generator.html` - poster generator
- `project/random-street.html` - random moving street
- `project/gallery.html` - gallery of saved building PNGs
- `project/server.js` - local Express server
- `project/assets/generated-buildings/` - saved building PNGs

## How to run it

First, install Node.js if you do not already have it:

https://nodejs.org/

Then open Terminal and run:

```bash
git clone git@github.com:inhapovarova/GenerativeGestaltung.git
cd GenerativeGestaltung/project
npm install
node server.js
```

When the server is running, open Chrome and go to:

```text
http://localhost:8000/single-building.html
```

Other pages:

```text
http://localhost:8000/index.html
http://localhost:8000/poster-generator.html
http://localhost:8000/random-street.html
http://localhost:8000/gallery.html
```

Keep the Terminal window open while using the project. To stop the server, press `Control + C` in Terminal.

## Saving buildings

Use the save button on `single-building.html`. Saved PNGs are stored locally in:

```text
project/assets/generated-buildings/
```

The poster generator and gallery load saved buildings from the local server endpoint:

```text
http://localhost:8000/api/buildings
```
