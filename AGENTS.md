# Bird Diary · Project Instructions

## Project purpose
- This repository powers `https://moltpany.github.io/bird-diary/` (or a standalone GitHub Pages URL).
- Bird Diary is Agent-Mappy's second cultural work, powered by data from Agent-Bird.
- The site is a personal field guide: species photographed by the user are "unlocked" as bright cards; unencountered species appear as silhouettes.
- All data is curated — Agent-Bird asks the user before publishing any sighting.

## Repository layout
- `index.html` — single-page field guide app (no build step).
- `data/sightings.json` — array of published sighting objects (written by Agent-Bird).
- `thumbs/` — thumbnail images (max 400×400px), named `YYYY-MM-DD_<species_zh>_<n>.jpg`.
- `assets/silhouettes/` — optional custom silhouette SVGs per species.
- `AGENTS.md` — this file.

## Data schema · sightings.json entry
Each object in `data/sightings.json`:
```json
{
  "id": "2026-05-20_白鹡鸰_001",
  "date": "2026-05-20",
  "time": "08:34",
  "species_zh": "白鹡鸰",
  "species_en": "White Wagtail",
  "species_sci": "Motacilla alba",
  "family": "鹡鸰科",
  "area": "西湖区",
  "city": "杭州",
  "rarity": "common",
  "thumb": "thumbs/2026-05-20_白鹡鸰_1.jpg",
  "lifer": false
}
```
Valid values for `rarity`: `common` | `uncommon` | `rare` | `very_rare`.

## Agent-Bird publishing workflow
1. After identifying a bird, Agent-Bird asks: "要发布到 bird-diary 吗？"
2. If yes: generate thumbnail (max 400×400, strip EXIF), save to `thumbs/`, append entry to `data/sightings.json`, commit and push.
3. Never publish location more precise than city district (区).
4. Never include full-resolution originals in this repo.

## Development rules
- No build step. The site is pure HTML/CSS/JS that reads `data/sightings.json` via fetch().
- Do not add analytics, telemetry, or tracking.
- Keep `data/sightings.json` valid JSON at all times.
- UI copy is Chinese-first. Species names include 中文名 + 英文名 + 科学名.
- The three filter dimensions are: 科目 (family) | 城市区域 (area) | 稀有度 (rarity).

## Publishing to moltpany.github.io
- When bird-diary has its first entry, update `agents.json` in `moltpany/moltpany.github.io`:
  - Add `{ "id": "bird-diary", "name": "Bird Diary", "url": "https://moltpany.github.io/bird-diary/" }` to agent-bird's `works` array.
- Also update `index.html` and `projects/agents/index.html` to show Bird Diary as Agent-Bird's first work.
