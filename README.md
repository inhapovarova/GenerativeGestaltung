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

<img width="1470" height="832" alt="Screenshot 2026-06-26 at 02 04 29" src="https://github.com/user-attachments/assets/c4d39c87-2ae0-4171-8206-49f678c31dd4" />

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

<img width="1085" height="833" alt="Screenshot 2026-06-26 at 02 06 30" src="https://github.com/user-attachments/assets/15d585fd-06e3-4dc6-a05a-f8c94dfb560d" />

## Saving buildings

Use the save button on `single-building.html`. Saved PNGs are stored locally in:

```text
project/assets/generated-buildings/
```

The poster generator and gallery load saved buildings from the local server endpoint:

```text
http://localhost:8000/api/buildings
```

<img width="1200" height="831" alt="Screenshot 2026-06-26 at 02 08 14" src="https://github.com/user-attachments/assets/556bd381-0aba-4337-87f1-622deac96d82" />

<img width="1240" height="1754" alt="generated_poster (57)" src="https://github.com/user-attachments/assets/7f67f630-70a6-4ad5-8304-0f5aa281c8b6" />

<img width="1240" height="1754" alt="generated_poster (65)" src="https://github.com/user-attachments/assets/88bd55f1-b864-45b6-a9af-b59e4a7324e7" />

<img width="1240" height="1754" alt="generated_poster (46)" src="https://github.com/user-attachments/assets/91993370-2b84-4a94-a206-6241d1cfbf15" />
