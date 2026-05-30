# Bird Diary · Project Instructions

## Project purpose
- This repository powers `https://moltpany.github.io/bird-diary/` (or a standalone GitHub Pages URL).
- Bird Diary is Agent-Mappy's second cultural work, powered by data from Agent-Bird.
- The site is a personal field guide: species photographed by the user are "unlocked" as bright cards; unencountered species appear as silhouettes.
- All data is curated — Agent-Bird asks the user before publishing any sighting.

## Repository layout
- `index.html` — single-page field guide app (no build step). Supports Chinese / English toggle.
- `data/sightings.json` — array of published sighting objects (written by Agent-Bird).
- `data/geo.json` — distribution-map geometry & per-species range data (see "Distribution maps" below).
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
  "family_en": "Wagtails",
  "area": "西湖区",
  "area_en": "Xihu District",
  "city": "杭州",
  "city_en": "Hangzhou",
  "rarity": "common",
  "thumb": "thumbs/2026-05-20_白鹡鸰_1.jpg",
  "lifer": false
}
```

### Required fields
| Field | Type | Description |
|---|---|---|
| `id` | string | `YYYY-MM-DD_<species_zh>_<NNN>` |
| `date` | string | ISO date `YYYY-MM-DD` |
| `species_zh` | string | Chinese species name |
| `species_en` | string | English common name |
| `species_sci` | string | Scientific (Latin) name |
| `family` | string | Chinese family name (e.g. `鹡鸰科`) |
| `family_en` | string | English family name (e.g. `Wagtails`) |
| `area` | string | District / area — no finer than district level |
| `area_en` | string | English district name (e.g. `Xihu District`); for non-Chinese locations use the native name |
| `city` | string | City name in Chinese (or native language for overseas) |
| `city_en` | string | City name in English |
| `rarity` | string | See valid values below |
| `thumb` | string | Relative path to thumbnail image |
| `lifer` | boolean | `true` if this is a first-ever sighting of this species |

### Optional fields
| Field | Type | Description |
|---|---|---|
| `time` | string | Local time `HH:MM` |
| `kind` | string | `bird` (default) or `friend`. See "Birds' friends" below. |

### Birds' friends · 鸟儿的朋友
Non-bird creatures the user photographs along the way (squirrels, butterflies,
dragonflies, etc.) can be recorded too — set `"kind": "friend"`. These entries:
- appear in a separate **"鸟儿的朋友 / birds' friends"** section below the main
  grid, so they never crowd out the birds;
- are **excluded** from the species/sightings/rarest statistics and from the
  family / region / rarity filters (those dimensions are bird-only);
- still use `species_zh` / `species_en` / `species_sci`, and may set `family` /
  `family_en` (e.g. 松鼠科 / Squirrels), `area`, `city`, `thumb`, `lifer`.
- `rarity` is ignored for friends (omit it).

Example friend entry:
```json
{
  "id": "2026-06-01_赤腹松鼠_001",
  "date": "2026-06-01",
  "species_zh": "赤腹松鼠",
  "species_en": "Pallas's Squirrel",
  "species_sci": "Callosciurus erythraeus",
  "family": "松鼠科",
  "family_en": "Squirrels",
  "area": "鄞州区",
  "area_en": "Yinzhou District",
  "city": "宁波",
  "city_en": "Ningbo",
  "kind": "friend",
  "thumb": "thumbs/2026-06-01_赤腹松鼠_1.jpg",
  "lifer": true
}
```

### Distribution maps · 分布范围地图
Each card flips on hover to reveal a map of the country where the species was
photographed, with the species' **approximate distribution shaded blue** and the
**user's own photo locations marked with a red circle**. This is driven by
`data/geo.json`:

```jsonc
{
  "bbox":      { "China": {lonMin,lonMax,latMin,latMax}, "UK": {...} },
  "provinces": { "浙江": [[lon,lat], ...], ... },   // 34 simplified China province outlines
  "uk":        [ [[lon,lat], ...], ... ],            // UK outline rings
  "ranges":    { "白头鹎": ["上海","浙江", ...], ... } // species_zh → province short-names
}
```

**When publishing a new species**, add a `ranges` entry keyed by `species_zh`,
listing the China **province short-names** where the bird occurs (breeding +
wintering). Province short-names are: `北京 天津 河北 山西 内蒙古 辽宁 吉林
黑龙江 上海 江苏 浙江 安徽 福建 江西 山东 河南 湖北 湖南 广东 广西 海南 重庆
四川 贵州 云南 西藏 陕西 甘肃 青海 宁夏 新疆 台湾 香港 澳门`. Look up the
species' real range (e.g. on a field guide / eBird) and list every province it
covers — it's fine to be approximate; this is an at-a-glance range, not a precise
map. Species seen only outside China (e.g. UK) need no `ranges` entry — the whole
foreign country outline is shaded.

**When photographing in a new city**, add the city to `CITY_COORDS_MAP` in
`index.html` as `'城市': [lon, lat, 'China'|'UK']`. For a brand-new country, also
add its `bbox` and an outline (under a new key alongside `uk`) to `geo.json` and
extend the renderer.

Notes:
- Ranges are intentionally approximate; province granularity is enough.
- Friends (squirrels etc.) may also have a `ranges` entry — same format.
- If `geo.json` is missing or a species has no range, the card back falls back to
  a plain text list of photo locations (non-fatal).

## Valid values for `rarity`
`common` | `uncommon` | `rare` | `very_rare` | `domestic`

### Family & area name reference
Common families already in use:

| `family` (中文) | `family_en` |
|---|---|
| 椋鸟科 | Starlings |
| 雀科 | Sparrows |
| 鹎科 | Bulbuls |
| 鹡鸰科 | Wagtails |
| 山雀科 | Tits |
| 噪鹛科 | Laughingthrushes |
| 鸫科 | Thrushes |
| 鹟科 | Flycatchers |
| 鸦科 | Crows & Jays |
| 燕科 | Swallows |
| 绣眼鸟科 | White-eyes |
| 杜鹃科 | Cuckoos |
| 鹭科 | Herons |
| 鸠鸽科 | Doves & Pigeons |
| 长尾山雀科 | Bushtits |
| 鸭科 | Ducks & Geese |

Common area/city pairs already in use:

| `area` | `area_en` | `city` | `city_en` |
|---|---|---|---|
| 徐汇区 | Xuhui District | 上海 | Shanghai |
| 鄞州区 | Yinzhou District | 宁波 | Ningbo |
| 番禺区 | Panyu District | 广州 | Guangzhou |
| 拱墅区 | Gongshu District | 杭州 | Hangzhou |
| 西湖区 | Xihu District | 杭州 | Hangzhou |

## Agent-Bird publishing workflow
1. After identifying a bird, Agent-Bird asks: "要发布到 bird-diary 吗？"
2. If yes: generate thumbnail (max 400×400, strip EXIF), save to `thumbs/`, append entry to `data/sightings.json`, commit and push.
3. **Always fill `family_en`, `area_en`, `city_en`** — use the reference tables above; for new families/areas, look up the standard English name.
4. Never publish location more precise than city district (区).
5. Never include full-resolution originals in this repo.

## Development rules
- No build step. The site is pure HTML/CSS/JS that reads `data/sightings.json` via fetch().
- Do not add analytics, telemetry, or tracking.
- Keep `data/sightings.json` valid JSON at all times.
- UI supports Chinese (default) and English — the toggle button is in the top-right nav.
- Species names include 中文名 + 英文名 + 科学名.
- The three filter dimensions are: 科目/Family | 城市区域/Region | 稀有度/Rarity.

## Publishing to moltpany.github.io
- When bird-diary has its first entry, update `agents.json` in `moltpany/moltpany.github.io`:
  - Add `{ "id": "bird-diary", "name": "Bird Diary", "url": "https://moltpany.github.io/bird-diary/" }` to agent-bird's `works` array.
- Also update `index.html` and `projects/agents/index.html` to show Bird Diary as Agent-Bird's first work.
