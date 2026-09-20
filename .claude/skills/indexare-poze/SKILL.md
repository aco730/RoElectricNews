---
name: indexare-poze
description: Indexează vizual un folder de poze de arhivă (lucrări fotovoltaice/electrice), le grupează pe lucrări reale (nu pe lună), elimină duplicatele aproape identice, le încadrează în categorii, și le adaugă în baza de date centrală `baza-date-poze/poze-index.json`. Folosește acest skill când apar poze noi, neindexate, în arhiva foto a proiectului sep.
---

# Indexare poze — proces (validat pe arhiva 2022-2024, 605 poze / 30 carduri → 373 poze / 27 carduri reale)

## Când se folosește
Când există poze noi în arhivă (`poze-portofoliu/raw/Takeout/...` sau orice folder nou de export Google Photos / WhatsApp) care nu apar încă în `baza-date-poze/poze-index.json`.

## Pași

### 1. Extrage EXIF-ul real (nu inventa date/locații)
Fiecare poză originală (`.jpg`) are de obicei `DateTimeOriginal` valid în EXIF — extrage-l cu:
```
python -c "from PIL import Image; img=Image.open(r'<path>'); print(img._getexif())"
```
(pe Windows Git Bash, comanda e `python`, nu `python3`).

**GPS-ul lipsește aproape mereu** (telefoane cu locație dezactivată / poze trecute prin WhatsApp) — nu presupune o locație exactă. Poți menționa un indiciu vizual (tip acoperiș, vegetație, clădiri din fundal) dar **niciodată ca fapt confirmat**.

### 2. Grupează pe ferestre de timp, nu pe lună calendaristică
Sortează pozele după timestamp. Poze la <1-2 ore distanță = aproape sigur aceeași vizită/lucrare. Un salt de zile = altă lucrare, chiar dacă fișierele au fost puse în același folder/lună de export.

### 3. Vezi efectiv fiecare poză (Read tool, nu doar numele fișierului)
Pentru fiecare cluster de timp, deschide pozele (thumbnail `_l.webp` e suficient) și descrie ce arată: tip lucrare, echipament vizibil (marcă/model dacă se vede pe etichetă), stadiu (montaj/finalizat), context vizual (culoare acoperiș, gard, clădiri).

### 4. Identifică duplicatele aproape identice
În cadrul aceluiași cluster, poze la <30s distanță cu compoziție aproape identică = candidat de redundanță. Păstrează 1-2 cele mai informative (unghi diferit, detaliu nou), mută restul.

**Excepție obligatorie**: verifică întâi dacă poza e folosită ca imagine `hero-slide` în `index.html` înainte s-o muți — niciodată nu muta o poză hero.

### 5. Încadrează în una din cele 7 categorii
`fotovoltaic_rezidential`, `fotovoltaic_comercial`, `tablou_electric`, `diagnoza_reparatii`, `smart_home`, `cctv_it`, `altele`.

### 6. Mută fizic pozele redundante
```
mv thumbs/<id>_l.webp thumbs/<id>_s.webp pozeredundante/
```

### 7. Scrie/actualizează logul de analiză
Adaugă intrarea în `analiza-carduri-log.json` (același format ca intrările existente — vezi structura: `original_name`, `total_photos`, `jobs_found[]` cu `label`, `date_range`, `category`, `photo_ids_kept`, `photo_ids_moved_redundant`, `notes`).

### 8. Reconstruiește cardurile site-ului
Rulează scripturile din `site-solar-electric-panel/` care citesc logul și rescriu `data.js` (vezi `data.js.backup-*` pentru referința ultimei reconstrucții — scripturile Node folosite au fost `rebuild-projects.cjs` și `merge-small-cards.cjs`, șterse după rulare dar reproductibile din acest SKILL.md dacă e nevoie).

**Regulă de calitate**: fiecare card final trebuie să aibă minim 5 poze. Cardurile sub 5 se grupează într-un card "Diverse montaje <categorie> <an>" — vezi pasul de merge.

### 9. Regenerează baza de date centrală
```
cd baza-date-poze
node build-database.cjs
```
Asta citește `data.js` + `analiza-carduri-log.json` actualizate și rescrie `poze-index.json` cu toate pozele (kept + redundant), câmpuri complete (vezi `README.md` din același folder pentru schema exactă).

## Reguli de onestitate (nenegociabile)
- Nu inventa locații, prețuri, sau afirmații de calificare (ex. "autorizat") pe baza pozelor.
- Nu presupune un nume de client din poze — dacă nu apare explicit (etichetă, sticker), nu-l ghici.
- Dacă o poză arată o siglă a altei firme (subcontractor/partener), semnalează explicit utilizatorului înainte s-o incluzi pe site — nu o eticheta automat ca fiind treaba proprie.
