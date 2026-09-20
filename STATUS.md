# sep-website — Status

_Ultima actualizare: 2026-09-20, sfârșit de zi (~18:01), după 2 sesiuni lungi de lucru (13 august → 20 septembrie 2026)_

Site live: **https://roelectricnews.netlify.app** — blog **RoElectricNews** (169 articole, nișă electric/fotovoltaic/smart
home/stocare energie) + mini-site business **Solar Electric Panel (SEP)** sub `/electrician` (Teo Marcu, electrician,
servește **București + Ilfov**, explicit **NU** Făgăraș).

Repo: `github.com/aco730/RoElectricNews`, branch `master` (producție) + branch `test-whatsapp-primary` (variantă A/B test,
branch deploy separat pe Netlify). Working copy curată de lucru: `D:\730dash\sep-website`. Original git-tracked (conține și
foldere legacy pre-fuziune care nu trebuie atinse): `D:\730dash\projects\business\sep`.

---

## 🟢 Ce e live și funcțional chiar acum

### Conținut
- **Blog RoElectricNews** — 169 articole, 11 categorii (toate acoperite, inclusiv cele 4 integrate ulterior:
  Șantier & Structură, Arhitectură, Design Interior, Outdoor & Peisagistică), fără erori consolă.
- **Mini-site electrician** (`/electrician`) — Servicii, Portofoliu, Prețuri, Calculatoare, wizard ofertă — 13 pagini,
  fiecare cu titlu + meta descriere SEO unice, geo-targetate "București & Ilfov".
- **Portofoliu real** — 588 poze din 32 șantiere documentate (2022–2026), afișate cu counter animat pe homepage.
- **16 pagini per zonă/sector** — `/electrician/zone/[sector-1...6, voluntari, otopeni, pipera, popesti-leordeni,
  bragadiru, chiajna, buftea, corbeanca, domnesti, magurele]` + index, linkuite din footer și navbar.

### SEO / discoverabilitate
- Titluri + meta descrieri unice pe toate cele 13 pagini electrician (fix pentru bug-ul vechi în care toate foloseau
  aceeași descriere = numele site-ului).
- Sitemap, robots.txt, schema.org (LocalBusiness, BreadcrumbList, FAQPage, Article) — deja solide dinainte.
- **Algolia Crawler** — indexare activă (vezi secțiunea dedicată mai jos), pe lângă căutarea internă.
- **Căutare internă reală** (`/cauta`) — acoperă blog + prețuri + FAQ + pagini din mini-site-ul electrician, nu doar
  articole. Căutarea "baterie" → 12 rezultate din site + 3 articole blog, testat live.
- Zero pretenții false de certificare ANRE pe site-ul electrician (verificat, curățat 5 locații).

### Conversie / lead-gen
- Buton WhatsApp plutitor pe tot site-ul (blog + electrician).
- Telefon vizibil în header, pe ambele secțiuni ale site-ului.
- CTA prezent pe toate paginile relevante (servicii, prețuri, calculatoare, homepage).
- Formular de contact cu status vizibil (✅/⚠️/⏳) + buton WhatsApp alături de telefon.
- Calculator fotovoltaic cu **date reale de producție solară** (PVGIS, Comisia Europeană) pe bază de adresă —
  nu doar un slider generic.
- Pagină 404 personalizată cu linkuri utile + CTA telefon.

### Split test WhatsApp vs telefon (A/B, în desfășurare)
- Branch `master` = telefon primar ("📞 Sună Acum"), branch `test-whatsapp-primary` = WhatsApp primar
  ("💬 Trimite Poză pe WhatsApp").
- Configurat în Netlify (Project configuration → Developer settings → Split Testing), 50/50, status **Running**.
- **Tracking click-uri live**: `/api/click-stats.json?key=<ADMIN_PASSWORD>` — numărătoare per variantă/buton, stocată
  în Netlify Blobs, populată automat de `/api/track-click` (POST) la fiecare click pe butoanele din hero.
- ⚠️ **Neconfirmat independent**: testele repetate (curl cu user-agent de browser + tab real de browser) au primit
  mereu varianta `master`, fără cookie `nf_ab` vizibil. Nu e dovadă că split-ul nu funcționează (poate fi
  particularitate a request-urilor automate/sandbox), dar **necesită verificare manuală** de pe un telefon/browser
  real (câteva ferestre incognito noi) înainte să tragi concluzii din numărătoarea de click-uri.

### Algolia Crawler — complet configurat și activ
- Domeniu `roelectricnews.netlify.app` verificat (metodă meta tag, `algolia-site-verification` în `Layout.astro`).
- Crawler „RoElectricNews" creat, pornit automat, status „Crawling" confirmat live.
- Plugin-ul Netlify (`@algolia/netlify-plugin-crawler`) rulează curat pe ambele branch-uri, fără erori — a necesitat
  reparare (vezi „Probleme reparate" mai jos).

### Netlify — funcții active (toate gratuite)
- Web Analytics (bazat pe server logs, zero cookie-uri/script client — se potrivește cu design-ul fără analytics al site-ului)
- Real User Monitoring (Core Web Vitals)
- Build plugin Lighthouse (rulează audit la fiecare build)
- Build plugin Algolia Crawler
- Split Testing (Beta)

### Google Business Profile
- Website + WhatsApp click-to-chat legate (`wa.me/40750405908`, setat ca principal).
- Zonă de deservire: **doar București** (Făgăraș exclus explicit, la cererea proprietarului).
- Categorii, descriere, servicii cu prețuri — deja complete dinainte de a începe lucrul aici.

---

## 🟡 Deschis / neterminat (nu blocant)

- **Logo + poză de copertă GBP** — nu s-a putut încărca automat (blocat de iframe extern + dialog nativ de fișiere);
  logo disponibil la `public/images/brand/logo-sep.png`, task manual ~30 secunde pentru proprietar.
- **Poze suplimentare portofoliu în GBP** — profilul are doar 2 poze generice față de 588 disponibile.
- **Recenzii clienți GBP** — neverificat câte există real / neinițiat butonul "Ask for reviews".
- **Reclamă Google plătită** — "Your ad is not set up" — decizie separată, neconfigurată intenționat.
- **Program de lucru GBP** — inconsistență între Google (07:00-16:00) și site (07:00-18:00), lăsată neschimbată
  la cererea explicită a proprietarului.
- **Titluri generice portofoliu** — ex. "Fotovoltaice — Aprilie 2024" nu spune nimic despre locație/mărime sistem.
- **94/169 articole blog fără FAQ** — gol de conținut, nu bug, opțional de completat.
- **Migrare `<img>` → `astro:assets`** — pentru responsive images automate, opțional, nu critic (imaginile sunt deja WebP).
- **Testare UX mobilă reală prin unelte proprii** — fix-ul de contor mobil (vezi mai jos) a fost o reparație țintită
  pentru un simptom raportat, nu un audit QA mobil complet.

---

## 🔧 Probleme reale găsite și reparate (istoric complet)

| # | Problemă | Cauză reală | Fix | Commit |
|---|---|---|---|---|
| 1 | `spawn EINVAL` în `/admin/audit` (Windows) | `execFile('npx.cmd', ...)` fără `shell:true` — bug cunoscut Node pe Windows | Adăugat `shell: process.platform === 'win32'` în `src/lib/audit.ts` | `5739dcb` |
| 2 | 4 categorii de blog "orfane" (51 articole, 30%) invizibile în taxonomie | Nu existau în `src/data/categories.json`, deși erau în frontmatter-ul articolelor | Adăugate oficial: Șantier & Structură, Arhitectură, Design Interior, Outdoor & Peisagistică | `5739dcb` |
| 3 | Inconsistență GDPR | Flag-uri `foloseșteAnalytics`/`foloseșteCookieuriMarketing` = `true` în `legal-config.json`, dar nu exista niciun script real de analytics client-side | Dezactivate flag-urile — elimină nevoia de banner cookie | `647248e` |
| 4 | Deploy accidental pe proiectul greșit | `netlify deploy` rulat într-un folder fără `package.json` local → npm a urcat în ierarhie și a construit dashboard-ul 730dash (Next.js) în loc de site-ul de redirect | Prins live din log-uri, deploy anulat din dashboard înainte să publice; adăugat `package.json` + `netlify.toml` local în folderul de redirect | — (acțiune manuală, nu commit de cod) |
| 5 | Site nou de redirect (buildhubro) returna 401 | Vizibilitate implicită "Private" moștenită de la echipă | Schimbat manual în Netlify → Project configuration → General → Visitor access → Public | — |
| 6 | `Hero2` (folosit pe homepage electrician) nu randa `badge`/WhatsApp secundar/`microCopy` deși erau în date | Componenta template avea 3 variante (Hero1/2/3), doar Hero2 lipsea implementarea completă | Extins Hero2 să afișeze toate câmpurile | `e0c19d7` |
| 7 | Toate cele 13 pagini electrician aveau **aceeași** meta descriere (= numele site-ului) | `description={site.siteName}` hardcodat în loc de valoare per-pagină, câmpul `description` nici nu exista în modelul `Page` | Adăugat `description?: string` în `src/lib/types.ts`, fix în `[...slug].astro`, setate descrieri unice pe toate 13 pagini | `e0c19d7` |
| 8 | Contorul din HeroCTA (buton primar) nu deschidea link-uri externe în tab nou | Doar butonul secundar avea `target="_blank"`/`rel`, cel primar nu | Adăugat pe toate 3 template-urile Hero (Hero1/2/3) | `4c6c843`+ |
| 9 | Algolia Crawler eșua la build cu "Missing ALGOLIA_API_KEY" | Formularul de instalare al plugin-ului Netlify nu a salvat efectiv variabilele de mediu ca variabile reale de proiect | Adăugate manual `ALGOLIA_BASE_URL`/`ALGOLIA_API_KEY` din Project configuration → Environment variables, scopate corect (Production + Deploy Previews + Branch deploys) | `85f083a` |
| 10 | Algolia Crawler eșua în continuare: `FetchError ... /admin/404` | Cheia API era acum corectă, dar nu exista încă niciun obiect Crawler creat — Algolia cere verificare de domeniu + creare crawler ca pași separați | Verificat domeniul (meta tag), creat crawler-ul "RoElectricNews", pornit automat | `85f083a` + acțiuni în dashboard Algolia |
| 11 | Contorul animat de poze/șantiere rămânea blocat la "0" pe mobil | Scriptul depindea 100% de `IntersectionObserver`, fără fallback — pe browsere in-app (WhatsApp/Instagram) sau webview-uri unde API-ul lipsește/eșuează/nu se declanșează, rămânea permanent la valoarea inițială | `try/catch` la crearea observer-ului + `setTimeout` de 2.5s ca plasă de siguranță necondiționată | `e3addf0` |

---

## Stack tehnic

Astro 7 (output `server`, adapter `@astrojs/netlify` în producție / `@astrojs/node` local), React 19 (islands,
`client:load`), Tailwind CSS 4, `sharp` (procesare imagini), `xlsx` (sursă conținut `continut-site.xlsx`),
`@netlify/blobs` (tracking click-uri, disponibil tranzitiv prin `@astrojs/netlify`). Hosting: Netlify.
Sync conținut: `npm run sync` (Python), poze noi: `npm run add-photos`.

## Workflow de lucru (obligatoriu de respectat)

Toată editarea se face **întâi** în copia de lucru curată `D:\730dash\sep-website` (server local `astro dev`,
`astro build` de verificare). Fiecare fișier modificat se copiază (`cp`) în folderul original git-tracked
`D:\730dash\projects\business\sep` (care conține și foldere legacy — nu se șterg/ating niciodată), **abia apoi**
se face commit + push din folderul original. Nu se comite niciodată direct din `sep-website`.
