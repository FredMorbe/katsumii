# skyline3d.entry.js

Source of the scene embedded in `../concept-h-skyline3d.html` (three.js, bundled and inlined).

Rebuild: `NODE_PATH=<repo>/node_modules node_modules/.bin/esbuild skyline3d.entry.js --bundle --minify --format=iife --outfile=bundle.js`,
then paste `bundle.js` into the page's `<script>`.

URL params: `?q=low` (no MSAA, fewer raindrops, DPR 1) · `?t=12` (skip the camera intro).
