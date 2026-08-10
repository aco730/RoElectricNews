---
name: "genereaza-articol-electric-news"
description: "Skill unificat pentru Electric NEWS: primește (a) un link către un articol scris, (b) un link YouTube, (c) o idee brută fără link, sau (d) o cerere de agregare din surse de specialitate ('verifică ce e nou', 'agregă surse') — și produce un articol REAL (nu doar titlu), cu poză, adăugat în calendarul editorial Excel, cu site-ul regenerat și verificat. Înlocuiește/unifică skill-urile mai vechi adauga-idee-electric-news (care adăuga doar rândul, fără conținut) și articol-din-youtube-electric-news. Declanșează pe fraze ca „bagă asta", „fă un articol din linkul ăsta", „transformă video-ul în articol", „vezi ce e nou pe ANRE/AFM", „agregă din surse", „adaugă în calendar și scrie articolul"."
---

## De ce există acest skill

Varianta veche (`adauga-idee-electric-news`) adăuga doar rândul în Excel și o pagină-schelet fără text — 53 de articole publicate fără conținut real a fost exact problema descoperită și reparată pe 9 august 2026. Acest skill produce întotdeauna conținut real: fie rescris dintr-o sursă verificată, fie un ghid original, niciodată doar un placeholder.

## Punctele de intrare

Conținut nou poate ajunge din trei locuri, toate triate la fel:

1. **Direct în chat** — userul lipește un link/transcript/idee în conversație.
2. **Pagina publică `pagina/trimite-o-stire/`** (formular Netlify Forms — funcțional automat din momentul deploy-ului, fără backend) — pentru cititori/colaboratori externi.
3. **`admin/index.html`** (pagina de administrare locală, adăugată 9 august 2026 — vezi „Fluxul admin" mai jos) — formular local, fără backend, dedicat userului pentru publicare rapidă, care generează un fișier `.json` de procesat prin `scripts\watch_cereri_publicare.py`.

Orice submisie, indiferent de sursă, se triază așa:

- **Link YouTube** → Modul 2 (cere/așteaptă un fișier `.txt` cu transcriptul, nu se poate extrage automat — vezi motivul mai jos).
- **Orice alt link** (articol, comunicat, blog) → Modul 1, integral automat.
- **Idee brută, fără link** → Modul 3.
- **Listă de linkuri** → fiecare link, pe rând, prin Modul 1.
- **Site/canal de monitorizat** → Modul 4 (agregator) — propune candidați, nu publică automat.

### Fluxul admin (`admin/index.html`)

Pagină locală, **nu face parte din site-ul public**, nu se deploy-uiește niciodată pe Netlify (stă în afara `site-local/`). Userul completează tipul sursei + conținutul, apasă „Descarcă cererea" — se salvează un fișier `cerere-<tip>-<timestamp>.json` în `cereri-publicare/`.

Pași, când userul spune „verifică cereri noi":
1. Rulează `py scripts\watch_cereri_publicare.py` — listează cererile neprocesate (fișierul `.processed-manifest.json` din `cereri-publicare/` ține evidența).
2. Pentru fiecare cerere nouă, procesează după `tip` (`link`→Modul 1, `youtube`→Modul 2, `lista`→Modul 1 repetat, `sursa`→Modul 4) — `titlu_propus`, `categorie_sugerata` și `nota` din fișier sunt indicii, nu decizii finale; categoria și titlul reale se stabilesc tot din conținutul sursei.
3. După confirmarea userului și publicarea efectivă (vezi „Pasul final" mai jos), **mută fișierul cererii din `cereri-publicare/` în `cereri-publicare/executate/`** (folosește `shutil.move`, păstrează numele) — asta face vizibil, la o simplă privire în folder, ce mai e de procesat vs. ce e deja publicat. Marchează totodată cererea ca procesată în manifest (`{ "nume-fisier.json": {"slug": ..., "procesat_la": ...} }`) — la fel ca la Modulul 2 (YouTube).

**Notă despre formularul admin**: `admin/index.html` scrie cererile direct în `cereri-publicare/` fără pas de descărcare/mutare manuală, dacă browserul e Chrome/Edge și userul a apăsat o dată „Conectează folderul" (File System Access API, permisiune persistentă via IndexedDB). Pe Firefox/Safari, care nu suportă asta, formularul cade automat pe descărcare clasică + mutare manuală — ambele variante produc același format de fișier `.json`, deci restul fluxului nu se schimbă.

## Fișierele și scripturile țintă

- Excel: `C:\Users\730\Desktop\electric NEWS\electric-news-calendar-editorial.xlsx` — trei foi relevante:
  - „Calendar editorial" (coloane A-J: Săpt. / Dată propusă / Categorie / Tip / Titlu articol / Sursă / URL sursă / Status / Sponsorizat / Etichete)
  - „Q&A" — întrebări generice de categorie (10 per categorie, afișate pe pagina categoriei), coloane: Categorie / Întrebare / Răspuns / Articole (slug-uri legate, sau `pagina:slug` pentru pagini statice)
  - „Q&A Articole" — 5 întrebări specifice per articol (afișate în stânga paginii articolului), coloane: Slug articol / Întrebare / Răspuns — vezi „Pasul Q&A articol" mai jos
- Articole text complet: `C:\Users\730\Desktop\electric NEWS\articole-text\<slug>.txt` — primul rând = titlu, rând gol, apoi corpul cu paragrafe separate prin rând gol. `build_site.py` citește automat acest fișier dacă există (după slug-ul articolului) și afișează conținutul real; fără el, rândul rămâne `În așteptare` și nu apare deloc pe site.
- Poze articol: `C:\Users\730\Desktop\electric NEWS\site-local\assets\images\articole\<slug>.jpg` + manifest comun `...\articole\.image-manifest.json` (urmărește sursa fiecărei poze: `generated` / `external` / `stock-pexels` / `youtube-thumbnail`).

**REGULĂ CRITICĂ (din 9 august 2026, după DOUĂ incidente reale de pierdere de poze)**: toate cele 4 scripturi de imagini (`gen_images.py`, `gen_article_images.py`, `fetch_source_images.py`, `fetch_stock_image.py`) **nu suprascriu niciodată automat un fișier deja existent pe disc** — nici poze de categorie, nici de articol, indiferent de sursă (generată, reală, Pexels, manuală). Dacă fișierul există, scriptul sare peste el și afișează „SĂRIT". Se generează/descarcă doar pentru sloguri **noi**, fără fișier. Pentru o actualizare intenționată a unei poze deja existente, fiecare script acceptă `--force <slug>` (sau `--force-all` la `gen_images.py`) — **folosește asta doar când userul cere explicit o poză nouă pentru un articol/categorie anume**, niciodată "ca să văd ce iese" sau într-o rulare în bloc.
- Scripturi:
  - `scripts\build_site.py` — regenerare site (doar rândurile Status=Publicat), citire conținut real, filtrare + curățare pagini pentru rândurile În așteptare.
  - `scripts\check_links.py` — verificare linkuri (0 moarte, 0 externe neverificate obligatoriu).
  - `scripts\gen_article_images.py` — poză generică unică per articol (variație de nuanță + iconiță din titlu), fallback când nu există poză reală.
  - `scripts\fetch_source_images.py` — poză reală din og:image al paginii sursă (merge și pe YouTube — ia thumbnail-ul oficial); primește opțional listă de slug-uri ca argumente.
  - `scripts\fetch_stock_image.py <slug> "<query>"` — poză reală de la Pexels (pentru articole fără sursă externă), cu credit foto automat pe pagină. Cheie API în `PEXELS_API_KEY` din `.env` (fișier local, niciodată în cod).
  - `scripts\fetch_source_dates.py` — extrage data reală de publicare a sursei (meta `article:published_time`, JSON-LD `datePublished`, `uploadDate` pentru YouTube); `--apply` scrie în Excel, fără el doar afișează (dry-run).
  - `scripts\recalc_rezumat.py` — recalculează integral foaia „Rezumat" din rândurile curente.
  - `scripts\set_publish_status.py` — recalculează coloana Status pentru toate rândurile pe baza fișierelor din `articole-text\`.
  - `scripts\watch_youtube_transcripts.py` / `scripts\add_youtube_article.py` — pipeline-ul Modulului 2.
  - `scripts\watch_cereri_publicare.py` — listează cererile neprocesate din `cereri-publicare/` (create prin `admin\index.html`); vezi „Fluxul admin" mai sus.

Toate scripturile Python folosesc căi relative la propria locație (`ROOT = dirname(dirname(__file__))`) — merg identic local (`py scripts\build_site.py`) sau într-un sandbox cu folderul montat, fără modificări.

## Modul 1 — Link către un articol scris (Agregat)

1. Fetch pe link. Dacă e blocat, oprește-te pe acel link și anunță — nu ocoli.
2. Extrage faptele reale: cifre, citate exacte (cu nume + funcție dacă există), termene, context legislativ. Nu rezuma la o linie — ai nevoie de destul detaliu ca să scrii 4-5 paragrafe.
3. Stabilește categoria (una din cele 5 fixe), titlul editorial (concret, nu traducere mecanică), sursa (nume scurt al publicației).
4. Scrie articolul: ~350-500 cuvinte, ton Electric NEWS (tehnic, sobru, unghi concret, nu promoțional). Structură: paragraf de deschidere cu faptul central → 2-3 paragrafe cu detalii/context/citate reale → paragraf final cu implicații practice pentru cititor + mențiune explicită a sursei în text ("Sursă: X."). Dacă un detaliu cerut de titlu (ex. "cine poate aplica") nu apare în sursă, spune asta direct în articol — nu inventa.
5. Salvează `articole-text\<slug>.txt` (slug = aceeași funcție de slugificare ca în `build_site.py`, din titlu).
6. **Data reală**: înainte de a scrie rândul în Excel, rulează `py scripts\fetch_source_dates.py --apply` (procesează toate rândurile Publicat cu URL, deci și rândul nou) — extrage data reală de publicare a sursei din pagina deja făcută fetch la pasul 1 (meta `article:published_time`, JSON-LD `datePublished`). Coloana `Dată propusă` primește **data reală a sursei, nu una secvențială artificială**. Dacă nicio dată nu se găsește, păstrează următoarea dată liberă din secvență ca fallback.
7. Adaugă rândul în Excel (vezi „Pasul Excel" mai jos) — cu data reală de la pasul 6, nu cu următoarea zi din secvență.
8. Poză: rulează `py scripts\fetch_source_images.py <slug>` (extrage og:image din pagina sursă). Dacă eșuează (fără imagine, imagine prea mică, blocaj), rulează `py scripts\gen_article_images.py` ca fallback — generează automat poza procedurală unică pentru orice slug nou din Excel fără poză existentă.
9. Regenerează + verifică (vezi mai jos) — `build_site.py` sortează descrescător după `Dată propusă`, deci homepage-ul arată mereu cel mai recent articol (după data reală) ca hero, nu cel mai vechi.

## Modul 2 — Link YouTube (transcript dat manual de utilizator)

`youtubetotranscript.com` e blocat de Cloudflare (challenge JS) și API-ul intern `timedtext` al YouTube cere acum o sesiune de browser validă — niciuna nu merge cu fetch simplu, fără browser real. Soluția funcțională, validată:

1. Utilizatorul pune manual un fișier `.txt` cu transcriptul video-ului în `C:\Users\730\Desktop\electric NEWS\transcripturi-youtube\` (primul rând, opțional, poate fi URL-ul YouTube complet).
2. Rulează `py scripts\watch_youtube_transcripts.py` — listează fișierele noi, neprocesate încă (urmărite în `transcripturi-youtube\.processed-manifest.json`).
3. Citește transcriptul real (poate fi STT brut, cu erori de transcriere — interpretează sensul, nu copia greșelile) și scrie un **rezumat editorial scurt, ~250-300 cuvinte, citibil de un om în ~2 minute**, cu titlu relevant din conținut. Mai scurt decât restul articolelor Electric NEWS — asta e convenția specifică pentru categoria YouTube.
4. Salvează `articole-text\<slug>.txt` (titlu pe primul rând, rând gol, apoi rezumatul).
5. Rulează `py scripts\add_youtube_article.py "<fisier.txt>" "<titlu>" "<nume canal>"` — adaugă rândul în Excel cu **Categorie = YouTube** (categorie dedicată, nu una din cele 5 originale), Tip = Agregat, recalculează Rezumat automat.
6. Poză: `py scripts\fetch_source_images.py <slug>` — funcționează direct și pe pagina `youtube.com/watch?v=...` (og:image = thumbnail-ul oficial). Dacă manifestul nu marchează deja sursa corect, ajustează-o manual la `"source": "youtube-thumbnail"` (risc de drepturi ~zero, spre deosebire de pozele din presă).
7. Regenerează + verifică.

## Modul 3 — Idee brută, fără link (Propriu)

1. Stabilește categoria, titlul, unghiul concret (ghid, comparație, calcul de preț).
2. Scrie conținut original (~400-550 cuvinte) pe baza expertizei tehnice reale a domeniului (electric, fotovoltaic, baterii) — fără cifre sau afirmații legale inventate cu falsă precizie; dacă un detaliu tehnic nu e sigur, formulează general ("de regulă", "în practică") în loc să inventezi un număr exact.
3. Salvează `.txt`, adaugă rândul (Tip = Propriu, Sursă = „—" sau o referință de preț dacă există, URL = „Conținut propriu — fără sursă externă unică").
4. Poză: nicio sursă externă de unde să extragi o poză reală. Ordine de încercare (adăugată 9 august 2026):
   1. `py scripts\fetch_stock_image.py <slug> "<query în engleză, specific>"` — poză reală de la Pexels (cheie API în `PEXELS_API_KEY` din `.env`, nu în cod). **Alege tu query-ul, cu grijă** — verifică rezultatul vizual (`Read` pe fișierul salvat) înainte să confirmi: evită poze cu logo-uri vizibile de firme, poze cu oameni/text care nu au legătură clară cu subiectul. Dacă primul rezultat nu e potrivit, încearcă alt query, nu accepta orbește primul rezultat.
   2. Dacă Pexels nu are nimic potrivit, `py scripts\gen_article_images.py` ca fallback final (poză procedurală unică, generată din categorie + titlu).
   Poza Pexels primește automat credit foto vizibil pe pagină (nume fotograf + link), spre deosebire de pozele generate (care primesc eticheta „Ilustrație").
5. Regenerează + verifică.

## Modul 4 — Agregator din surse de specialitate

Surse de pornire (de extins împreună cu utilizatorul pe măsură ce apar altele bune):
- ANRE — anunțuri/comunicate: `https://www.anre.ro/ro/presa/comunicate-de-presa`
- AFM — Casa Verde: `https://www.afm.ro/main/programe/casa_verde_fotovoltaice.php` (verifică și pagina curentă a programului de baterii)
- Digi24, secțiunea energie: `https://www.digi24.ro/stiri/economie/energie`
- Economica.net, energie: `https://www.economica.net/energie`

Pași:
1. Fetch pe fiecare sursă din listă, extrage titlurile + linkurile celor mai recente articole/comunicate.
2. Compară fiecare URL cu coloana „URL sursă" din Excel — elimină tot ce e deja indexat.
3. Din ce rămâne, filtrează doar ce se încadrează în cele 5 categorii Electric NEWS (ignoră știri de energie generale fără legătură cu prosumatori/electric/smart home/baterii).
4. **Nu publica automat** — prezintă utilizatorului o listă scurtă de candidați (titlu + sursă + 1 propoziție de ce e relevant) și cere confirmare pe care să-i transformi în articole complete (Modul 1, pentru fiecare confirmat). Motivul: calitatea editorială a selecției contează mai mult decât viteza, iar utilizatorul cunoaște mai bine ce e cu adevărat relevant pentru cititorii lui.

## Pasul Excel (comun tuturor modurilor)

Deschide cu `openpyxl.load_workbook` (**niciodată** nu recrea fișierul). Determină `Săpt.`/`Dată propusă` continuând secvența zilnică de la ultimul rând completat. Respectă stilurile deja stabilite (font Arial 10, wrap text, culori pe categorie — vezi rândurile existente ca referință). Dacă URL-ul dat există deja în coloana G, anunță că e deja indexat și nu duplica. Recalculează integral foaia „Rezumat" din toate rândurile (nu incrementa manual) — rulează `py scripts\recalc_rezumat.py`. Salvează la aceeași cale.

**Coloana I — Sponsorizat** (adăugată 9 august 2026, obligatoriu de întrebat din 9 august 2026): `Da` sau `Nu`, niciodată presupus. Când e `Da`, pagina articolului arată un badge vizibil „Conținut sponsorizat" lângă categorie.
- **Cerere venită din `admin/index.html`** → fișierul `.json` are câmpul `sponsorizat` (`"Da"`/`"Nu"`), completat obligatoriu în formular — folosește direct valoarea, fără să mai întrebi.
- **Cerere venită direct în chat** (link/idee lipite de user în conversație) → înainte de a scrie rândul în Excel, întreabă explicit „e conținut sponsorizat sau nu?" dacă userul nu a precizat deja — nu presupune niciodată `Nu` implicit.

**Coloana J — Etichete** (adăugată 9 august 2026): text liber, mai multe etichete separate prin virgulă (ex. „DIY, Prețuri"). Deliberat **etichete transversale, nu categorii noi** — userul a decis explicit asta pe 9 august 2026 (vs. crearea de categorii noi ca YouTube). Nu inventa etichete la întâmplare — dacă articolul se potrivește clar cu un subiect transversal recunoscut (ghid practic → „DIY", articol de opinie → „Opinie", ghid de preț → „Prețuri", produs/tehnologie nou apărută → „Tehnologie nouă"), adaugă eticheta; altfel lasă coloana goală. Fiecare etichetă generează automat o pagină la `pagina/eticheta/<slug>/`.

**Coloana H — Status** (adăugată 9 august 2026): fiecare rând trebuie să aibă `Publicat` (fundal verde, font alb bold) dacă fișierul `articole-text\<slug>.txt` există deja în momentul salvării rândului, altfel `În așteptare` (fundal gri, italic). Acest skill scrie mereu conținutul înainte de a adăuga rândul în Excel, deci practic orice rând adăugat prin acest skill primește direct `Publicat`. `build_site.py` **generează pagini doar pentru rândurile cu Status = Publicat** — un rând `În așteptare` există în Excel dar nu apare deloc pe site, nici în categorie, nici pe homepage, până capătă conținut și status-ul e schimbat manual sau prin `py scripts\set_publish_status.py` (recalculează statusul tuturor rândurilor pe baza fișierelor existente în `articole-text\`).

## Pasul Q&A articol (obligatoriu, adăugat 9 august 2026)

Orice articol nou primește, alături de conținut, exact **5 întrebări specifice lui** (nu generice de categorie — acelea sunt separate, în foaia „Q&A"), afișate în coloana din stânga paginii articolului:

1. După ce conținutul e scris, formulează 5 întrebări care testează fapte/cifre/afirmații concrete din text — genul de întrebări pe care și le pune cineva care tocmai a citit articolul.
2. Fiecare răspuns e 1-2 propoziții scurte, extrase direct din articol — niciodată informație nouă, neverificată.
3. Adaugă rândurile în foaia „Q&A Articole" din Excel (coloane: Slug articol / Întrebare / Răspuns) — 5 rânduri noi, cu slug-ul exact al articolului.
4. `build_site.py` detectează automat dacă un articol are rânduri în „Q&A Articole" și comută layout-ul paginii pe 3 coloane (Q&A stânga / articol centru / „din aceeași categorie" dreapta) — nu necesită nicio altă configurare.

## Pasul de confirmare (obligatoriu pentru cererile din fluxul admin)

Pentru conținut venit prin `admin/index.html` / `cereri-publicare/` (userul nu e prezent activ în conversație când cererea a fost creată), **nu marca rândul `Publicat` automat**. După ce conținutul + poza + Q&A sunt gata:

1. Arată un rezumat scurt: titlu, categorie, sursă, ce poză s-a folosit — 2-4 propoziții.
2. Așteaptă confirmarea explicită a userului înainte de a rula `set_publish_status.py` / a marca rândul Excel `Publicat`.
3. Pentru cereri primite direct în chat (userul e deja acolo, discută live), acest pas se suprapune cu conversația normală — nu introduce o pauză artificială suplimentară.

## Pasul final (comun tuturor modurilor)

1. `py scripts\build_site.py` — regenerează homepage, pagina categoriei, pagina articolului nou (acum cu conținut real, pentru că fișierul `.txt` există).
2. `py scripts\check_links.py` — trebuie „0 linkuri moarte, 0 linkuri externe neverificate". Dacă raportează probleme, oprește-te și repară înainte să confirmi.
3. Confirmă scurt utilizatorului: titlu, categorie, sursă, ce poză s-a folosit (reală/YouTube/generată) — 2-4 propoziții, fără să retrimiți fișiere dacă nu se cere explicit.

## Reguli importante

- Niciodată nu inventezi un URL, un citat, o cifră sau conținutul unui video — totul pornește din sursa reală extrasă efectiv.
- Poze reale extrase din alte site-uri de presă (Modul 1) sunt marcate `"source": "external"` în manifest **special ca să fie ușor de identificat și înlocuit înainte de orice deploy public** — nu sunt licențiate pentru republicare pe un site live fără verificare separată de drepturi. Thumbnail-urile YouTube (Modul 2) și pozele generate procedural (Modul 3, fallback) nu au această restricție.
- Nu suprascrie niciodată un rând Excel existent sau un fișier `.txt`/poză deja creat(ă), decât la cerere explicită de corecție.
- Mai multe linkuri/idei simultan → procesează-le pe toate, o singură salvare Excel + o singură regenerare de site la final.
- Păstrează limba română și tonul editorial (tehnic, sobru, unghi concret) în toate modurile.
