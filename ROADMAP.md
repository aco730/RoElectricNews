# sep-website — Roadmap

_Ultima actualizare: 2026-09-20._ Unde se îndreaptă proiectul de aici încolo, cu prioritate reală (impact
lead-gen/SEO întâi). Pentru istoricul complet a ce s-a făcut deja, vezi `TODO.md` (secțiunile „Rezolvate")
și `STATUS.md` (fotografia stării curente).

## Etape deja parcurse (nu mai sunt "roadmap", sunt istorie)

~~1. Stabilizare git~~ — făcut, tot codul e commis și pushat pe `master` + `test-whatsapp-primary`.
~~2. Consolidare structură rute~~ — verificat, era deja curat.
~~3. Optimizare performanță (imagini)~~ — făcut, WebP peste tot.
~~4. Optimizare SEO de bază (sitemap, meta, structured data)~~ — făcut.
~~5. Rebranding complet~~ — făcut (Electric NEWS/BuildHub.ro → RoElectricNews/Solar Electric Panel).
~~6. Val mare de UI/UX pentru lead-gen (căutare, zone, WhatsApp, PVGIS, SEO geo)~~ — făcut.
~~7. Split test WhatsApp vs telefon + tracking click-uri~~ — configurat și pornit.
~~8. Algolia Crawler~~ — configurat și activ.

## Ce urmează, în ordinea impactului

### 🔴 Prioritate mare

1. **Confirmă manual că split test-ul chiar împarte traficul 50/50.** Verificarea automată din unelte
   (curl, browser din automatizare) nu a putut confirma cookie-ul `nf_ab` — deschide site-ul din câteva
   ferestre incognito reale, de pe telefon și desktop, și verifică dacă vezi alternativ telefon-primar și
   WhatsApp-primar. Dacă split-ul nu funcționează, ia în calcul alternativa: forțează manual varianta prin
   query param sau folosește un flag simplu bazat pe hash de IP/sesiune, în loc să te bazezi pe feature-ul
   Beta al Netlify.
2. **Citește rezultatele tracking-ului de click-uri după ~2 săptămâni** (`/api/click-stats.json?key=...`)
   și decide câștigătorul (WhatsApp primar vs telefon primar). Odată decis, elimină branch-ul de test și
   fixează varianta câștigătoare pe master, oprește split test-ul din Netlify.
3. **Task-uri manuale Google Business Profile** — logo, poză copertă, poze suplimentare din portofoliu,
   solicitare recenzii. Astea sunt friction redus / impact mare pentru un profil cu 72 interacțiuni deja
   existente — probabil cel mai bun raport efort/rezultat rămas pe listă.
4. **Titluri descriptive pentru proiectele de portofoliu** — "Fotovoltaice — Aprilie 2024" → ceva de genul
   "Sistem hibrid 6kW, Sector 3" — ajută atât SEO cât și conversia (vizitatorul vede imediat ce a fost făcut).

### 🟡 Prioritate medie

5. **Verifică rezultatele indexării Algolia Crawler** — peste câteva ore/zile, uită-te în dashboard-ul
   Algolia câte pagini a indexat efectiv crawler-ul "RoElectricNews" și dacă datele extrase (titluri,
   conținut) sunt utile. Decide dacă merită integrat vizual pe site (înlocuind sau completând `/cauta`)
   sau rămâne doar infrastructură pregătită pentru mai târziu.
6. **Testare UX mobilă reală, cu unelte proprii** (telefon fizic sau emulator corect configurat) — nu doar
   fix-uri punctuale pe simptome raportate ca la contorul de poze. Verifică wizard-ul de ofertă, calculatoarele,
   formularul de contact, meniul de navigare pe ecrane mici.
7. **Completează FAQ la cele 94/169 articole care nu au** — nu e urgent, dar ajută rich snippets în Google.
8. **Decide despre reclamă Google plătită** ("Your ad is not set up" în GBP) — discuție separată de buget,
   nu tehnică.

### 🟢 Prioritate mică / igienă tehnică

9. **Migrare opțională `<img>` → `astro:assets`** — pentru `srcset`/responsive images automate; nu e critic
   fiindcă imaginile sunt deja WebP optimizate manual, dar ar simplifica întreținerea viitoare.
10. **Review manual al perechilor de articole plauzibil duplicate** semnalate de `/admin/articole-duplicate`
    (verificat o dată, nicio pereche nu era duplicat real — de revizuit periodic pe măsură ce se adaugă
    articole noi).

## Fără plan concret momentan (de discutat cu proprietarul dacă devin relevante)

- Extindere zonă de deservire dincolo de București + Ilfov (inclusiv Făgăraș) — exclus explicit până acum,
  ar necesita decizie separată și re-lucru pe pagini de zonă/GBP/SEO local.
- Reclamă plătită Google Ads.
- Recenzii solicitate activ de la clienți existenți.
