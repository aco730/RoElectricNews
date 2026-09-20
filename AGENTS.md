# Instrucțiuni pentru asistenți AI — sep-website / RoElectricNews / Solar Electric Panel

Acest fișier e pentru orice sesiune AI (Claude Code sau altul) care lucrează în acest repo. Citește și
`STATUS.md` (starea curentă) și `TODO.md` (istoric complet) înainte de a începe o sarcină — proiectul
evoluează des, informația de-aici decade rapid.

## Workflow obligatoriu: două foldere, nu unul

- **`D:\730dash\sep-website`** (acest folder) = copie de lucru curată. Aici se editează, aici rulează
  `astro dev` / `astro build` pentru verificare. Nu are foldere legacy, nu are istoric git relevant pentru
  acest conținut.
- **`D:\730dash\projects\business\sep`** = originalul git-tracked (remote `github.com/aco730/RoElectricNews`).
  Conține și foldere legacy pre-fuziune ("Firmă montaj fotovoltaic...", "electric NEWS" vechi, etc.) care
  **nu trebuie niciodată șterse sau suprascrise accidental**.
- **Reguli:**
  1. Editează în `sep-website`.
  2. Verifică cu `npx astro build` (sau `astro dev`) în `sep-website`.
  3. Copiază (`cp`) fișierele schimbate în calea echivalentă din `projects\business\sep`.
  4. Rulează din nou `astro build` **în folderul tracked** înainte de commit (confirmă că fișierele au ajuns corect).
  5. Commit + push **doar din `projects\business\sep`**, niciodată din `sep-website`.
- Dacă există un branch secundar activ (ex. `test-whatsapp-primary`, folosit pentru split testing), orice
  schimbare comună (fix, feature nou, nu specifică testului A/B) trebuie mers pe master **și** apoi merge-uită
  în branch-ul secundar, ca ambele variante să rămână identice cu excepția diferenței testate. Verifică
  `git branch -a` la începutul sesiunii ca să știi ce branch-uri există.

## Reguli de business — nu le încălca fără instrucțiune explicită

- **Zero pretenții de certificare ANRE** pe site-ul electrician (`/electrician/**`) — SEP nu are certificare
  ANRE reală, se folosește „electrician calificat" / „Electrician calificat". Mențiunile ANRE din articolele
  de blog (context jurnalistic/legal despre autoritatea de reglementare) sunt corecte și nu se ating.
- **Zona de deservire e doar București + Ilfov.** Nu adăuga Făgăraș (nici pe site, nici în Google Business
  Profile, nici în pagini de zonă) fără cerere explicită — a fost exclus intenționat la cererea proprietarului
  ("BAGA SI CHAT WHATAPP DAR NU BAGA FAGARAS LASA DOAR BUCURESTI").
- Nu inventa numere/statistici (poze, șantiere, prețuri) — folosește mereu date reale din `src/data/*.json`
  sau din portofoliul real de poze.

## Capcane tehnice descoperite (nu le redescoperi de la zero)

- **`execFile`/`spawn` cu fișiere `.cmd` pe Windows** — eșuează cu `spawn EINVAL` fără opțiunea
  `{ shell: true }` (sau `shell: process.platform === 'win32'`). Vezi `src/lib/audit.ts`.
- **`/admin` și `/api/admin/*` sunt blocate (404) în producție pe Netlify**, prin `src/middleware.ts`
  (`if (peNetlify && pathname.startsWith('/admin')) return 404`). Orice endpoint care trebuie accesibil live
  (ex. statistici) trebuie plasat în afara acestui prefix — vezi `/api/click-stats.json.ts` ca exemplu.
- **Formularul de instalare al plugin-urilor Netlify (ex. Algolia Crawler) poate să NU salveze efectiv
  variabilele de mediu introduse acolo.** Verifică întotdeauna în Project configuration → Environment
  variables după instalare — dacă lipsesc, adaugă-le manual acolo, scopate corect pe toate contextele
  relevante (Production / Deploy Previews / Branch deploys).
- **Algolia Crawler cere doi pași separați** înainte să funcționeze: (1) verificare de proprietate a
  domeniului (meta tag/DNS/etc, în dashboard-ul Algolia → Crawler → Domains), (2) creare efectivă a unui
  Crawler pentru domeniul verificat. Doar a avea cheia API nu e suficient.
- **`IntersectionObserver` fără fallback poate eșua silențios pe browsere in-app mobile** (WhatsApp,
  Instagram etc.) — orice animație/comportament declanșat de el trebuie să aibă un `try/catch` la creare și
  un timeout de siguranță care forțează starea finală corectă. Vezi scriptul de count-up din `Layout.astro`.
- **Rulare build local pe Windows:** dacă lucrezi din bash/git-bash, `rm -rf dist` înainte de fiecare
  `astro build` repetat evită artefacte vechi care confundă verificarea.
- **Netlify Split Testing (Beta)** nu e ușor verificabil din unelte automate (curl, browser controlat automat)
  — cererile din acest tip de mediu pot ateriza mereu pe aceeași variantă fără cookie `nf_ab` vizibil. Nu trage
  concluzii din teste automate; recomandă verificare manuală din browser real.

## Unde găsești conținutul

- Articole blog: colecție de conținut Astro, sursă de adevăr în `continut-site.xlsx`, sincronizat prin
  `npm run sync` (`scripts/sync_content.py`).
- Poze portofoliu: `poze-noi/` → `npm run add-photos` detectează foldere noi automat.
- Conținutul mini-site-ului electrician (hero, carduri, prețuri, FAQ, CTA-uri): `src/data/portofoliu-electrician-content.json`,
  editabil vizual din `/admin` (local, nu în producție) prin `SiteEditor`.
- Prețuri/materiale pentru calculatoare și wizard-ul de ofertă: `src/data/materiale-preturi.json`.

## Documentație asociată

`STATUS.md` (stare curentă), `TODO.md` (istoric + task-uri deschise), `ROADMAP.md` (priorități viitoare),
`PROJECT.md` (referință tehnică completă), `MEMORY.md` (context/decizii care nu sunt evidente din cod).

---

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
