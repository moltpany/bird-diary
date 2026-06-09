# portraits/ · generation task brief (for Codex)

Generate one **2D character portrait per species** for the Bird Diary windowsill
game, from the user's own photo, using **image-to-image** so each bird keeps its
real plumage/shape while the whole set shares one illustrated "house style".

The rendering side is already live: `index.html` reads `data/portraits.json` and,
for any species with an entry, shows the portrait instead of the photo. So you can
fill this in gradually — every entry you add lights up in the game.

## For each species

1. **Input photo (image-to-image source):** the `thumb` path in the manifest
   below (the repo only ships thumbnails; if a higher-res original is available
   elsewhere, prefer it, but the thumb is fine).
2. **Generate** with the canonical prompt (next section) — *only the species name
   changes; keep everything else identical for every bird so the set stays
   cohesive.* Always image-to-image from the photo, never pure text-to-image.
3. **Post-process:** autocrop to the subject, keep transparency, fit into a
   256×256 canvas with a small margin, save as WebP (quality ~88) to the
   `out` path in the manifest.
4. **Register:** add the key to `data/portraits.json` (keep it valid JSON):
   `"<species_zh>": "portraits/<species_zh>.webp"` — the key must match
   `species_zh` exactly (including any parentheses).
5. After a batch, **commit**: `git add portraits/ data/portraits.json && git commit`.

## Canonical style prompt

> Replace only `{SPECIES_EN}` / `{SPECIES_ZH}`. Do not paraphrase the rest.

```
Turn this photo of a {SPECIES_EN} ({SPECIES_ZH}) into a cute 2D game character
illustration. Keep the bird's real colors, markings, beak shape and body
proportions faithful to the photo. Style: soft flat vector with gentle cel
shading, clean rounded shapes, a friendly slightly chibi proportion (slightly
larger head), calm storybook palette, subtle paper-grain texture. The animal is
in a relaxed side-profile pose facing right, full body, both feet visible as if
standing on a ledge, centered with generous margin. Transparent background. No
text, no border, no drop shadow, no extra objects, no background scenery.
```

Fixed params: square 1:1, transparent background (alpha), one image per species.

**Notes**
- For the non-bird "friends" (squirrels, butterflies) the same prompt works —
  it says "the animal", and a butterfly naturally won't have feet on a ledge;
  that's fine, just keep it side-profile, full body, transparent background.
- If a result is off-model (wrong colors / added text/background), retry once
  with the same prompt; if still bad, skip that species (the photo stays as
  fallback) rather than shipping an inconsistent one.

## Output checklist (per portrait)
- [ ] transparent background, no baked-in shadow/border
- [ ] ≤ 256×256 WebP
- [ ] colors faithful to the real photo
- [ ] registered in `data/portraits.json` under the exact `species_zh` key

## Manifest (32 species)

| species_zh (registry key) | species_en | kind | source photo | out |
|---|---|---|---|---|
| `丝光椋鸟` | Silky Starling | bird | `thumbs/2026-05-09_丝光椋鸟_1.jpg` | `portraits/丝光椋鸟.webp` |
| `树麻雀` | Eurasian Tree Sparrow | bird | `thumbs/2026-05-09_树麻雀_1.jpg` | `portraits/树麻雀.webp` |
| `灰椋鸟` | White-cheeked Starling | bird | `thumbs/2026-05-10_灰椋鸟_1.jpg` | `portraits/灰椋鸟.webp` |
| `白头鹎` | Light-vented Bulbul | bird | `thumbs/2026-05-09_白头鹎_1.jpg` | `portraits/白头鹎.webp` |
| `白鹡鸰` | White Wagtail | bird | `thumbs/2026-05-11_白鹡鸰_1.jpg` | `portraits/白鹡鸰.webp` |
| `远东山雀` | Japanese Tit | bird | `thumbs/2026-05-10_远东山雀_1.jpg` | `portraits/远东山雀.webp` |
| `黑脸噪鹛` | Masked Laughingthrush | bird | `thumbs/2026-05-11_黑脸噪鹛_1.jpg` | `portraits/黑脸噪鹛.webp` |
| `乌鸫` | Common Blackbird | bird | `thumbs/2026-05-11_乌鸫_1.jpg` | `portraits/乌鸫.webp` |
| `北灰鹟` | Asian Brown Flycatcher | bird | `thumbs/2026-05-16_北灰鹟_1.jpg` | `portraits/北灰鹟.webp` |
| `喜鹊` | Common Magpie / Oriental Magpie | bird | `thumbs/2026-05-26_喜鹊_1.jpg` | `portraits/喜鹊.webp` |
| `家燕` | Barn Swallow | bird | `thumbs/2026-05-10_家燕_1.jpg` | `portraits/家燕.webp` |
| `暗绿绣眼鸟` | Japanese White-eye | bird | `thumbs/2026-05-10_暗绿绣眼鸟_1.jpg` | `portraits/暗绿绣眼鸟.webp` |
| `白喉红臀鹎` | Sooty-headed Bulbul | bird | `thumbs/2026-05-10_白喉红臀鹎_1.jpg` | `portraits/白喉红臀鹎.webp` |
| `红嘴蓝鹊` | Red-billed Blue Magpie | bird | `thumbs/2026-04-20_红嘴蓝鹊_1.jpg` | `portraits/红嘴蓝鹊.webp` |
| `苍鹭` | Grey Heron | bird | `thumbs/2026-05-24_苍鹭_1.jpg` | `portraits/苍鹭.webp` |
| `褐翅鸦鹃` | Greater Coucal | bird | `thumbs/2026-05-10_褐翅鸦鹃_1.jpg` | `portraits/褐翅鸦鹃.webp` |
| `鹊鸲` | Oriental Magpie-Robin | bird | `thumbs/2026-05-28_鹊鸲_1.jpg` | `portraits/鹊鸲.webp` |
| `黑短脚鹎` | Black Bulbul | bird | `thumbs/2026-05-17_黑短脚鹎_1.jpg` | `portraits/黑短脚鹎.webp` |
| `黑领椋鸟` | Black-collared Starling | bird | `thumbs/2026-05-10_黑领椋鸟_1.jpg` | `portraits/黑领椋鸟.webp` |
| `夜鹭` | Black-crowned Night Heron | bird | `thumbs/2026-05-20_夜鹭_1.jpg` | `portraits/夜鹭.webp` |
| `珠颈斑鸠` | Spotted Dove | bird | `thumbs/2026-05-29_珠颈斑鸠_1.jpg` | `portraits/珠颈斑鸠.webp` |
| `红头长尾山雀` | Black-throated Bushtit | bird | `thumbs/2026-05-29_红头长尾山雀_1.jpg` | `portraits/红头长尾山雀.webp` |
| `鸿雁` | Swan Goose | bird | `thumbs/2026-05-29_鸿雁_1.jpg` | `portraits/鸿雁.webp` |
| `家鹅` | Domestic Goose | bird | `thumbs/2026-05-29_家鹅_1.jpg` | `portraits/家鹅.webp` |
| `凤头鸭` | Crested Duck | bird | `thumbs/2026-05-29_凤头鸭_1.jpg` | `portraits/凤头鸭.webp` |
| `松鼠（赤腹松鼠）` | Pallas's Squirrel | friend | `thumbs/2026-05-19_松鼠_1.jpg` | `portraits/松鼠（赤腹松鼠）.webp` |
| `松鼠（欧亚灰松鼠）` | Eastern Gray Squirrel | friend | `thumbs/2025-05-24_松鼠_1.jpg` | `portraits/松鼠（欧亚灰松鼠）.webp` |
| `玉带凤蝶` | Common Mormon | friend | `thumbs/2026-05-31_玉带凤蝶_1.jpg` | `portraits/玉带凤蝶.webp` |
| `斑缘豆粉蝶` | Pale Clouded Yellow | friend | `thumbs/2026-05-31_斑缘豆粉蝶_1.jpg` | `portraits/斑缘豆粉蝶.webp` |
| `菜粉蝶` | Small White | friend | `thumbs/2026-05-31_菜粉蝶_1.jpg` | `portraits/菜粉蝶.webp` |
| `棕背伯劳` | Long-tailed Shrike | bird | `thumbs/2026-06-05_棕背伯劳_1.jpg` | `portraits/棕背伯劳.webp` |
| `黑尾蜡嘴雀` | Yellow-billed Grosbeak | bird | `thumbs/2026-06-07_黑尾蜡嘴雀_1.jpg` | `portraits/黑尾蜡嘴雀.webp` |
