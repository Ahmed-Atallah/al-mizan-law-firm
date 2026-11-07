# Al Mizan — Law Firm Website

A responsive Arabic-first law firm landing website with a procedural Three.js justice-scale sculpture, GSAP scroll choreography, pointer depth and reveal interactions.

## Run locally
Because `script.js` uses JavaScript modules, run the folder through a local web server (not by opening `index.html` directly).

For example, with Python installed:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Included
- `index.html` — page structure and content
- `style.css` — responsive visual design
- `script.js` — Three.js 3D scene, GSAP motion, pointer interaction, navigation, counters, reveal effects and language toggle

## Before publishing
- Replace the demo firm name, contact details, statistics, services and legal copy with verified client information.
- Replace the demo WhatsApp number in `index.html` (`https://wa.me/201000000000`) with the firm's actual number.
- Update the SEO title and description for the firm's real location and practice areas.
- Three.js and Google Fonts are loaded from CDNs, so the 3D scene and web fonts require an internet connection.
- This is a front-end showcase. It does not include a backend, appointment database, or form submission service.
