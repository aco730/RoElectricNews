# sep — Memory

Context și decizii care merită reținute despre acest proiect — motive din spatele unor alegeri, ce s-a
încercat și respins, capcane de urmărit. Pentru gotcha-uri pur tehnice de cod, vezi și `CLAUDE.md`/`AGENTS.md`.

## Decizii de brand/business

- **Rebranding complet** (2026-09-20): "Electric NEWS" (blog) + "BuildHub.ro" (domeniu vechi) →
  "RoElectricNews" (blog) + "Solar Electric Panel / SEP" (business electrician). Motivul exact al schimbării
  de nume nu e documentat explicit în istoric — a fost o decizie a proprietarului, aplicată consecvent peste
  site, GitHub, Netlify, Google Search Console. Domeniul vechi `buildhubro.netlify.app` a fost păstrat activ
  ca redirect 301 permanent (site Netlify separat, minimal) — nu se șterge, e nevoie de el pentru SEO/link-uri
  vechi care încă indexează spre el.
- **Zona de deservire e strict București + Ilfov, NU Făgăraș.** Asta pare contraintuitiv (owner-ul are
  legături cu Făgăraș — vezi skill-ul separat `oferta-fotovoltaic-stocare-fagaras` care există pentru o altă
  firmă/context din Făgăraș), dar pentru *acest* site (RoElectricNews/SEP) a fost o instrucțiune explicită
  și repetată să nu se amestece cele două piețe. Dacă apare vreodată confuzie despre "de ce nu punem și
  Făgăraș, doar e aproape" — răspunsul e că a fost o alegere deliberată, nu o omisiune.
- **Fără certificare ANRE reală.** SEP nu are (încă) certificare ANRE. Orice text care sugerează contrariul
  a fost eliminat intenționat și nu trebuie reintrodus, nici măcar indirect (ex. "conform normelor ANRE" în
  context de auto-promovare, spre deosebire de mențiuni jurnalistice despre ANRE ca autoritate, care sunt OK
  în articolele de blog).
- **Zero analytics/cookie-uri client-side, intenționat.** Nu e un gol de implementare — e o decizie de design
  care simplifică conformitatea GDPR (nu e nevoie de banner cookie). Netlify Web Analytics (activat 2026-09-20)
  respectă asta fiindcă e bazat pe server logs, nu pe script client.

## Ce s-a încercat și nu a mers (nu retesta la fel)

- **Confirmarea automată a split test-ului Netlify prin curl/browser automatizat** — repetat, mereu aceeași
  variantă (`master`), fără cookie `nf_ab` vizibil. Fie e o particularitate a request-urilor din medii automate
  (sandbox/agent), fie split test-ul Beta al Netlify are limitări reale. Nu presupune că funcționează doar
  pentru că e "Running" în dashboard — verifică din browser real dacă contează pentru o decizie.
- **Completarea formularului de instalare a unui plugin Netlify (Algolia Crawler) cu valorile de env vars
  direct în acel formular** — părea să funcționeze (plugin "enabled"), dar valorile NU au fost salvate ca
  variabile reale de proiect, cauzând erori de build ulterioare. Lecție: verifică întotdeauna separat, în
  Environment variables, după orice instalare de plugin prin formular dedicat.
- **`netlify deploy` rulat fără `package.json` local într-un folder de redirect minimal** — npm urcă în
  ierarhia de foldere și poate construi alt proiect complet diferit (s-a întâmplat: a încercat să construiască
  dashboard-ul 730dash în loc de site-ul de redirect). Orice folder Netlify separat (chiar și unul minimal,
  doar pentru redirect-uri) are nevoie de propriul `package.json` + `netlify.toml`.

## De ce anumite lucruri arată "ciudat" în cod (context, nu bug)

- Butonul secundar din `Hero1`/`Hero2`/`Hero3` e mereu stilizat verde (culoare WhatsApp) indiferent de text —
  e o simplificare de șablon (secundar = presupus WhatsApp), nu o eroare de branding dacă vreodată secundarul
  ajunge să fie altceva (ex. în split test, telefonul devine secundar și moștenește stilul verde — funcțional
  corect, doar vizual "verde pentru telefon", acceptat ca atare).
- `/api/click-stats.json` NU e sub `/api/admin/*` — pare inconsistent cu restul zonei de admin, dar e
  intenționat: tot ce e sub `/admin` sau `/api/admin/*` e blocat (404) în producție prin middleware, iar
  statisticile trebuie să fie citibile live.
