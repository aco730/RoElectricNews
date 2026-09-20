# RoElectricNews / Solar Electric Panel — sep-website

Site Astro cu două fețe:
- **Blog RoElectricNews** (`/`, `/blog`, `/categorie/[slug]`) — 169 articole despre electric, fotovoltaic,
  smart home și stocare de energie.
- **Mini-site business** `/electrician` — Solar Electric Panel (SEP), electrician calificat, servicii pentru
  **București + Ilfov**.

Live: **https://roelectricnews.netlify.app** · GitHub: **github.com/aco730/RoElectricNews**

## Orientare rapidă — ce fișier citești pentru ce

| Fișier | La ce folosește |
|---|---|
| `STATUS.md` | Fotografia stării curente — ce e live, ce e stricat, ce e în lucru. Citește-l primul. |
| `TODO.md` | Istoric complet, cronologic, al tot ce s-a rezolvat + listă de task-uri deschise. |
| `ROADMAP.md` | Ce urmează, în ordinea impactului. |
| `PROJECT.md` | Referință tehnică/arhitecturală — stack, structură, cum rulezi/deploiezi. |
| `CLAUDE.md` / `AGENTS.md` | Instrucțiuni pentru asistenți AI care lucrează în acest repo — convenții, capcane, workflow-ul de sincronizare pe două foldere. |
| `MEMORY.md` | Note despre decizii/context care nu sunt evidente din cod. |
| `baza-date-poze/README.md` | Documentație specifică bazei de date de poze din portofoliu. |

## ⚠️ Cea mai importantă regulă operațională

Acest folder (`D:\730dash\sep-website`) e o **copie de lucru curată**, fără istoric git relevant. Editările
reale se fac aici (dev server, build de verificare), dar **commit-ul și push-ul se fac din folderul original
git-tracked**: `D:\730dash\projects\business\sep`. Detalii complete în `PROJECT.md` → secțiunea "Workflow —
two-folder sync".

## Pornire locală

```
npm install
npm run dev
```

Deschide la `http://localhost:4321` (sau `4322`+ dacă portul e ocupat). Detalii complete de arhitectură,
scripturi disponibile și cum se face deploy: vezi `PROJECT.md`.

## Reguli de conținut/business — nu le încălca fără să întrebi

- **Nicio pretenție de certificare ANRE** pe site-ul electrician — SEP nu are certificare ANRE, folosește
  „electrician calificat". Mențiunile ANRE din articolele de blog (context jurnalistic/legal) sunt OK, cele
  de pe site-ul electrician nu.
- **Zona de deservire e doar București + Ilfov** — nu adăuga Făgăraș fără instrucțiune explicită a
  proprietarului (a fost cerut explicit să fie exclus).
- Vezi `CLAUDE.md`/`AGENTS.md` pentru lista completă de convenții și capcane descoperite în timp.
