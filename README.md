# Wisdom Compass

An interactive quote browser that maps 1,856 quotes from 285 historical authors onto a 2D Voronoi canvas, organised by topic and virtue.

## What it does

- Renders a clickable Voronoi map of ~40 virtue/topic nodes (Discipline, Courage, Gratitude, etc.) across four quadrants: Action, Acceptance, Self, World
- Click anywhere on the map to surface the 20 nearest quotes by spatial proximity to the click point
- Filter by author via a dropdown to highlight that author's topics on the map and list all their quotes
- All quote data is static, loaded from local JSON files (board_data.json, topic_coords.json) — no backend, no API

## Stack

- React 19, Vite
- D3-force (node collision layout), D3-Delaunay (Voronoi tessellation)
- Framer Motion (animations)
- Lucide React (icons)
- Vanilla CSS with custom tokens, dark theme

## Status

Parked

## Notes

- Local only — no deploy config, no hosting setup
- `npm run dev` starts on Vite default port 5173
- Quote data is pre-curated static JSON; no way to add quotes via the UI
- BoardRoom.jsx and AuthorSelection.jsx exist in components/ but are not used in the current App.jsx — likely abandoned earlier design iterations
