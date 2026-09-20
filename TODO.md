# sep-website — TODO

_Vezi și `STATUS.md` pentru o fotografie a stării curente și `ROADMAP.md` pentru priorități viitoare._

## Sesiunea 2 (2026-09-20, continuare) — split test, tracking, Algolia Crawler, fix mobil

- [x] **Algolia Crawler — complet configurat și activ** — rezolvat (2026-09-20): plugin-ul Netlify eșua la build
      ("Missing ALGOLIA_API_KEY") fiindcă formularul de instalare nu salvase efectiv variabilele de mediu. Adăugate
      manual `ALGOLIA_BASE_URL` (`https://crawler.algolia.com/`) și `ALGOLIA_API_KEY` (cheia specifică Crawler,
      NU cheia standard Search/Admin, obținută din Settings → Crawler API în dashboard-ul Algolia), scopate pe
      Production + Deploy Previews + Branch deploys. A mai apărut o a doua eroare (`FetchError ... /admin/404`) —
      cauzată de lipsa unui Crawler efectiv creat (Algolia cere verificare domeniu + creare crawler ca pași separați
      de cheia API). Verificat domeniul `roelectricnews.netlify.app` prin meta tag
      (`<meta name="algolia-site-verification" content="3E4FE363E7E8F7F6" />` în `Layout.astro`), creat crawler-ul
      "RoElectricNews" (start URL homepage, tipuri conținut: General web pages + Articles) — a pornit automat,
      status "Crawling" confirmat live. Build-uri curate pe ambele branch-uri după fix.
- [x] **Split test WhatsApp vs telefon — configurat și pornit** — rezolvat (2026-09-20): branch nou
      `test-whatsapp-primary` din master, inversată ordinea butoanelor CTA din hero (WhatsApp primar vs telefon
      primar pe master). Pe drum, reparat un bug real: butonul primar din Hero2 (și Hero1/Hero3 pentru consistență)
      nu avea `target="_blank"`/`rel` pentru linkuri externe — doar cel secundar avea, ceea ce ar fi făcut ca un
      click pe WhatsApp (dacă devine primar) să navigheze în afara site-ului în același tab. Split Testing Netlify
      configurat 50/50 master vs test-whatsapp-primary, status "Running". **Neconfirmat independent** dacă traficul
      chiar se împarte (testele automate de aici au primit mereu varianta master, fără cookie `nf_ab`) — recomandat
      test manual din browser real.
- [x] **Tracking click-uri pe butoanele CTA (WhatsApp vs telefon)** — rezolvat (2026-09-20): endpoint nou
      `/api/track-click` (POST, `prerender=false`) scrie în Netlify Blobs (`@netlify/blobs`, deja disponibil
      tranzitiv prin `@astrojs/netlify`, fără dependință nouă), cheie `${variant}:${button}` — varianta detectată
      automat server-side din env `BRANCH`. `onClick` adăugat pe toate butoanele CTA din Hero1/2/3, apel
      fire-and-forget (`fetch(..., {keepalive:true})`) care nu poate bloca/strica click-ul real. Statistici la
      `/api/click-stats.json?key=<ADMIN_PASSWORD>` — plasat în afara prefixului `/api/admin/*` fiindcă acel prefix
      întreg dă 404 hard în producție (middleware blochează admin panel-ul pe Netlify by design). Testat live:
      POST → 204, GET fără cheie → 401 (protejat corect). Notă de securitate: cheia trece prin query string URL —
      acceptabil pentru acest caz de uz cu miză mică, dar nu e un tipar corect de transport al secretelor.
- [x] **Fix: contoarele animate (588 poze / 32 șantiere) rămâneau blocate la 0 pe mobil** — rezolvat (2026-09-20),
      raportat direct de proprietar ("nu se incarca, am incercat pe mobil"). Cauză: scriptul de count-up din
      `Layout.astro` depindea 100% de `IntersectionObserver` fără nicio plasă de siguranță — pe browsere in-app
      (foarte plauzibil WhatsApp/Instagram, dat fiind că afacerea generează lead-uri prin WhatsApp) API-ul poate
      lipsi, arunca eroare, sau pur și simplu nu se declanșează, iar contorul rămânea permanent la textul inițial
      "0". Fix: `try/catch` la crearea observer-ului (fallback imediat la valoarea reală dacă API-ul lipsește/eșuează)
      + `setTimeout` necondiționat de 2.5 secunde care forțează valoarea finală corectă indiferent ce s-a întâmplat
      cu animația/observer-ul. Aplicat pe ambele branch-uri (master + test-whatsapp-primary), build verificat pe
      ambele.
- [x] **Merge sincronizat între master și test-whatsapp-primary** — după fiecare schimbare pe master (tracking,
      fix target=_blank, tag verificare Algolia, fix contor mobil) s-a făcut merge în test-whatsapp-primary, astfel
      încât singura diferență reală dintre cele două branch-uri să rămână ordinea butoanelor CTA din hero. A necesitat
      rezolvarea unui conflict real de merge în `Hero.tsx` (branch-ul de test avea propria versiune locală a acelorași
      linii) — rezolvat păstrând versiunea din master (superset: fix target=_blank + tracking), reconfirmat că swap-ul
      WhatsApp-primar din `content.json` a rămas intact (fișier separat, fără conflict).
- [x] **Documentație — actualizare completă toate fișierele .md** — rezolvat (2026-09-20): STATUS/TODO/ROADMAP/
      PROJECT/README/CLAUDE/AGENTS/MEMORY + `baza-date-poze/README.md` actualizate cu istoricul complet de lucru
      de la 13 august 2026 (primul commit real) până acum.

## Analiză concurență + UI/UX de impact (2026-09-20)

Cercetare pe site-uri reale de electricieni/fotovoltaic din România (electrician1.ro, Ferma de Energie,
ROMSIR etc.) — ce au ei și noi nu aveam:

- [x] **Buton WhatsApp plutitor pe tot site-ul** — rezolvat: adăugat în `Layout.astro` + `global.css`,
      fix jos-dreapta, cu puls animat, vizibil pe toate paginile (blog + electrician), fără suprapuneri
      verificate pe homepage, prețuri, wizard ofertă. Build verificat, fără erori.
- [x] **Calculator bazat pe adresă cu date satelitare (PVGIS)** — rezolvat (2026-09-20): adăugat câmp de
      adresă în `/electrician/calculatoare/fotovoltaic`. API route nouă `/api/electrician/pvgis.ts` face
      geocodare (Nominatim/OpenStreetMap, gratuit) → cheamă PVGIS (Comisia Europeană, date satelitare reale)
      → înlocuiește sliderul manual de producție cu valoarea reală pentru adresa exactă. Testat live cu
      adresă reală din București (1283 kWh/kWp/an, corect) și cu adresă invalidă (mesaj de eroare clar,
      fără să strice calculul anterior). Nu stocăm adresa nicăieri. Build verificat, sincronizat.
- [x] **Pagini dedicate per zonă/sector** — rezolvat (2026-09-20): 16 pagini noi
      `/electrician/zone/[sector-1...6, voluntari, otopeni, pipera, popesti-leordeni, bragadiru, chiajna,
      buftea, corbeanca, domnesti, magurele]` + index `/electrician/zone` (grid cu toate zonele), linkuit
      din footer ("Zone deservite"). Titluri/meta unice per pagină, text introductiv variat (nu duplicat),
      fără pretenții false de acoperire (Făgăraș exclus intenționat, doar București+Ilfov, confirmat cu userul).
      Build verificat: toate cele 17 pagini generate curat.
- [x] **Statistici mari, animate, tip counter** — rezolvat (2026-09-20): folosit scriptul deja existent
      `[data-count-to]` din `Layout.astro`, aplicat în `PortfolioPreview.tsx` (secțiunea "Lucrări reale" de
      pe homepage electrician) — "588+ poze reale" și "32 șantiere documentate", animate la scroll, cu numere
      calculate real din date (nu hardcodate). Build verificat.
- [x] **Telefon proeminent în header** — rezolvat (2026-09-20): mini-site electrician afișează acum numărul
      complet ("📞 0750 405 908") în capsula din header în loc de "Sună acum" generic (ascuns pe mobil îngust,
      înlocuit cu "Sună" scurt via Tailwind `sm:`). Header-ul blogului (RoElectricNews) nu avea deloc telefon
      vizibil — adăugat text verde "📞 0750 405 908" lângă butonul "Servicii Electrician" (ascuns sub 760px
      ca să nu aglomereze mobilul). Build verificat.

## Rezolvate (istoric, până la 2026-09-20)

- [x] Commit + push (2 runde) — proiect sincronizat pe `aco730/RoElectricNews`
- [x] Compresie WebP articole (42MB → 12.6MB)
- [x] Fix bug build Windows (`spawn EINVAL` în `/admin/audit`)
- [x] Integrate 4 categorii orfane (Șantier & Structură, Arhitectură, Design Interior, Outdoor & Peisagistică) — 169/169 articole acoperite
- [x] GDPR — rezolvată inconsistența analytics (dezactivat flag-uri, nu mai e nevoie de banner cookie)
- [x] Rebranding complet Electric NEWS → RoElectricNews (site, GitHub, Netlify, Search Console) + redirect 301 de pe vechiul domeniu
- [x] Verificat: formulare de contact/ofertă — Netlify Forms funcționale, cu notificare email activă, honeypot anti-spam

---

## Google Business Profile (2026-09-20)

Profil deja existent și verificat (72 interacțiuni clienți) — nu era de creat, era de completat.

- [x] Adăugat website: `roelectricnews.netlify.app/electrician`
- [x] Adăugat WhatsApp click-to-chat: `wa.me/40750405908`, setat ca principal
- [x] Verificat: categorii (Electrician + 3 secundare), descriere, servicii cu prețuri — deja complet și bine făcute
- [x] Zonă de deservire — lăsată doar București, la cerere explicită (nu Făgăraș)
- [x] Program lucru — inconsistență găsită (Google: 07:00-16:00 vs site: 07:00-18:00) — lăsat neschimbat, la cerere
- [ ] **Logo + poză de copertă lipsă** — nu am putut încărca automat (blocat de iframe extern + dialog nativ de fișiere); logo disponibil la `public/images/brand/logo-sep.png`, de încărcat manual în ~30 secunde
- [ ] Poze suplimentare din portofoliul real (588 disponibile) — profilul are doar 2 poze generice
- [ ] Recenzii de la clienți — verifică câte există real, folosește butonul "Ask for reviews"
- [ ] "Your ad is not set up" — reclamă Google plătită, decizie separată, neconfigurată

## Corecturi legale/conformitate (2026-09-20)

- [x] **Eliminate toate pretențiile false de certificare ANRE** — 5 locuri corectate în `portofoliu-electrician-content.json` (badge hero, 2 răspunsuri FAQ, CTA final, card "De ce SEP") → înlocuite cu "electrician calificat". Verificat: zero "ANRE" rămas pe site-ul electrician; mențiunile ANRE din blog/termeni (context jurnalistic/legal despre autoritatea de reglementare) au rămas neatinse, corect.
- [x] **Eliminată întrebarea FAQ "Emiți factură și garanție?"** — ștearsă complet de pe homepage electrician (întreba + răspundea afirmativ despre garanție scrisă/documente fiscale, legat de statutul de autorizare). Alte 2 mențiuni "factură" găsite (despre factura de curent a clientului) sunt context diferit, lăsate neatinse.

## TODO nou — audit UI/UX/content/leaduri (2026-09-20)

Bifează ce vrei să fac în continuare. Ordonate după impact asupra găsirii pe internet și generării de leaduri.

### 🔴 Impact mare — găsire pe internet (SEO local)

- [x] **Titluri geo-targetate + meta descrieri unice** — rezolvat (2026-09-20): adăugat câmp `description`
      în modelul de date (`Page` type + `[...slug].astro`), eliminat bug-ul cu `description={site.siteName}`
      identic peste tot. Titluri + descrieri unice setate pe toate cele 13 pagini ale mini-site-ului
      electrician, geo-targetate cu "București & Ilfov" (confirmat cu userul, tabel aprobat explicit).
      Breadcrumb-uri și H1-uri vizuale neafectate (rămân scurte, separate de titlul SEO). Verificat cu
      curl pe 5 pagini — titluri și meta descrieri toate distincte. Build verificat.
- [ ] **Titluri generice pe proiectele de portofoliu** — "Fotovoltaice — Aprilie 2024" nu spune nimic despre locație/mărime sistem. Titluri descriptive ("Sistem 6kW hibrid, Făgăraș") ajută atât SEO cât și conversia.

### 🟡 Impact mediu — conversie/leaduri

- [x] **CTA lipsă pe sub-paginile de Servicii** — rezolvat (2026-09-20): adăugate secțiuni CTA pe `servicii`, `servicii/electrice`, `servicii/fotovoltaice`. Verificat live.
- [x] **CTA lipsă pe Prețuri și Calculatoare** — rezolvat (2026-09-20): adăugate pe `preturi/fotovoltaic`, `preturi/electric`, `calculatoare/fotovoltaic`, `calculatoare/baterie`, `calculatoare/electric`. `calculatoare/rapid` sărit intenționat — are deja propriul buton WhatsApp de trimitere deviz.
- [x] **Pagină 404 lipsă** — rezolvat (2026-09-20): creat `src/pages/404.astro` cu 4 linkuri utile (Blog/Servicii/Portofoliu/Contact) + CTA telefon. Verificat live.
- [x] **Caseta de căutare din header** — rezolvat (2026-09-20): implementată căutare reală, extinsă și pe mini-site-ul electrician (nu doar blog). `Header.astro` e un `<form>` care trimite la `/cauta?q=...`; `/api/search-index.json` indexează articole + prețuri (per variantă Buget/Standard/Premium, cu titlu contextual) + FAQ + pagini din site-ul electrician; `/cauta` grupează rezultatele ("De la noi" vs "Articole"). Testat live: "baterie" → 12 rezultate din site (prețuri exacte fotovoltaic cu/fără baterie) + 3 articole blog. Click pe rezultat de preț duce direct la pagina corectă.
- [x] **Homepage electrician fără CTA final** — rezolvat (2026-09-20): adăugată secțiune CTA finală ("Convins de poze, nu de vorbe?" + statistici 588 poze/32 șantiere/ANRE) chiar înainte de footer.
- [x] **Mesaj de succes al formularului prea discret** — rezolvat (2026-09-20): box vizibil verde/roșu cu iconițe (✅/⚠️/⏳) pentru succes/eroare/loading, pe `/contact`.
- [x] **WhatsApp lipsă pe Contact** — rezolvat (2026-09-20): buton verde WhatsApp adăugat lângă "Sună acum" pe `/contact`.
- [x] **Bug găsit și reparat: butonul WhatsApp din hero-ul homepage electrician exista în date dar nu se afișa** — `Hero.tsx` avea 3 variante de template (Hero1/2/3), dar `Hero2` (cea folosită pe homepage) nu randa deloc `badge`, `secondaryCtaText` (WhatsApp) sau `microCopy`, deși datele conțineau tot ("certificat ANRE", buton WhatsApp, "răspundem în 10 minute"). Extins `Hero2` să afișeze aceste câmpuri. Verificat: doar homepage folosește acest template, nicio altă pagină afectată.

### 🟢 Impact mic / igienă conținut

- [x] **"Conținut original BuildHub.ro."** — rezolvat (2026-09-20): înlocuit în 16 articole. Liniile de credit final → "Conținut original RoElectricNews (roelectricnews.netlify.app)."; mențiunile din mijlocul textului → "RoElectricNews" (nume, nu URL brut, pentru lizibilitate).
- [ ] Review manual perechi articole plauzibil duplicate (unealta din `/admin/articole-duplicate`) — verificat deja, niciuna nu e duplicat real
- [ ] 94/169 articole fără FAQ — de completat dacă se dorește (nu urgent)
- [ ] Migrare opțională `<img>` → `astro:assets` pentru responsive images automate
- [ ] Testare UX mobilă reală printr-o unealtă proprie (telefon/DevTools) — fix-ul contorului (vezi mai sus) a fost
      o reparație țintită pentru un simptom raportat, nu un audit QA mobil complet

## Netlify — funcții gratuite explorate și activate (2026-09-20)

- [x] Web Analytics — activat (server-log based, fără script client/cookie-uri, se potrivește cu designul zero-cookie al site-ului)
- [x] Real User Monitoring — activat (Core Web Vitals)
- [x] Build plugin Lighthouse — activat (audit automat la fiecare build)
- [x] Build plugin Algolia Crawler — activat și funcțional (vezi secțiunea dedicată mai sus)
- [x] Split Testing (Beta) — activat și pornit (vezi secțiunea dedicată mai sus)

## Google Business Profile — rămas de făcut (task-uri manuale pentru proprietar)

- [ ] Logo + poză de copertă — blocat de automatizare (iframe extern + dialog nativ de fișiere), ~30 secunde manual;
      logo disponibil la `public/images/brand/logo-sep.png`
- [ ] Poze suplimentare din portofoliul real (588 disponibile, profilul are doar 2 poze generice)
- [ ] Recenzii de la clienți — verifică câte există real, folosește butonul "Ask for reviews"
- [ ] Reclamă Google plătită ("Your ad is not set up") — decizie separată, neconfigurată intenționat
- [ ] Program de lucru — inconsistență Google (07:00-16:00) vs site (07:00-18:00), lăsată neschimbată la cerere explicită
