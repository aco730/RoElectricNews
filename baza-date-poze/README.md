# Bază de date poze — portofoliu fotovoltaic/electric

Generată prin analiză vizuală asistată de Claude (fiecare poză a fost efectiv "văzută" și clasificată, nu doar sortată automat după dată).

## Fișier

**`poze-index.json`** — un singur fișier JSON, ușor de importat în orice alt proiect (Node, Python, un alt site, o bază de date reală etc).

## Structură

```
{
  "generated_at": "...",
  "schema_version": "1.0",
  "stats": { "total_cards": 27, "total_photos_kept": 297, "total_photos_redundant": 76, "total_photos_indexed": 373 },
  "cards": [ ... ],   // tabel sumar, un rând per lucrare/card
  "photos": [ ... ]   // un rând per poză individuală (inclusiv cele redundante, marcate ca atare)
}
```

### `cards[]` — o lucrare/card

| Câmp | Descriere |
|---|---|
| `card_id` | id-ul cardului pe site (ex: `j1`, `div-fotovoltaic-rezidential__2022`) |
| `title` | titlu real: `Categorie — descriere vizuală` |
| `category_id` / `category_label` | una din cele 7 categorii |
| `description` | rezumatul lucrării (ce s-a montat, ce arată pozele) |
| `date_from` / `date_to` | interval real din EXIF |
| `photo_count` | câte poze conține |
| `cover_photo_id` | id-ul pozei de copertă |
| `tags` | cuvinte-cheie detectate (branduri, tip echipament) |

### `photos[]` — o poză individuală

| Câmp | Descriere |
|---|---|
| `photo_id` | id unic (hash-ul original din arhivă) |
| `status` | `"kept"` (apare pe site) sau `"redundant"` (mutată, aproape identică cu alta) |
| `filename` | numele fișierului original |
| `thumb_small` / `thumb_large` | căi relative către thumbnail-uri (`.webp`) |
| `original_path` | calea către poza originală, needitată |
| `date` | data/ora exactă din EXIF (ISO 8601) |
| `year` | anul, extras pentru filtrare rapidă |
| `width` / `height` | dimensiuni |
| `card_id` / `card_title` / `card_description` | la ce lucrare aparține (`null` dacă e redundantă) |
| `category_id` / `category_label` | categoria |
| `is_cover_photo` | `true` dacă e poza de copertă a cardului |
| `tags` | cuvinte-cheie detectate |
| `duplicate_context` / `duplicate_reason` | doar la pozele redundante — de ce a fost scoasă |

## Unde sunt fișierele fizice de imagine

Thumbnail-urile **nu sunt duplicate aici** — bazele de date referă căile relative către:
- `../Firmă montaj fotovoltaic stocare zona Făgăraș/site-solar-electric-panel/thumbs/` (poze păstrate, active pe site)
- `../Firmă montaj fotovoltaic stocare zona Făgăraș/site-solar-electric-panel/pozeredundante/` (poze redundante, arhivate)

Dacă muți baza de date în alt proiect, copiază și folderele de thumbnail-uri (sau ajustează căile).

## Cum o regenerezi

Dacă mai editezi cardurile pe site (titluri, categorii, poze), rulează din nou:

```
cd baza-date-poze
node build-database.cjs
```

Scriptul citește direct din `data.js` + `analiza-carduri-log.json` ale site-ului și rescrie `poze-index.json`.
