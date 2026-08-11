---
description: Genereaza un articol de site pornind de la un link YouTube + transcript
---

Utilizatorul va furniza: (1) linkul YouTube, (2) transcriptul video-ului. Pe baza lor, creeaza un articol complet pentru site, urmand acest flux:

1. **Citeste transcriptul** si extrage ideile esentiale (fara umplutura, fara repetitii tipice de vorbire).
2. **Redacteaza articolul**, reinterpretat in stil propriu (nu copiere/rescriere 1:1 a transcriptului):
   - **Titlu** atractiv, specific, orientat spre subiectul practic tratat in video.
   - **Continut/rezumat** structurat pe sectiuni scurte cu subtitluri, scris ca sa poata fi citit in ~3 minute (cca 500-700 cuvinte), pastrand elementele esentiale si concluziile practice ale video-ului.
   - **Categorie** mapata pe taxonomia curenta a site-ului.
3. **Poza** - foloseste thumbnail-ul YouTube al video-ului (`https://img.youtube.com/vi/<ID>/maxresdefault.jpg`) ca imagine sursa; descarca-o local in `public/images/articole/` ca la fluxul standard de continut.
4. **Sursa** - seteaza `sursaNume` = numele canalului/video-ului YouTube, `sursaUrl` = linkul video-ului primit.
5. **FAQ** - genereaza 3-5 intrebari/raspunsuri (Q&A) derivate din continutul transcriptului, in acelasi format folosit de restul articolelor site-ului.
6. **Prezinta draftul complet in chat** (titlu, continut, categorie, poza propusa, sursa, FAQ) si asteapta confirmarea explicita a utilizatorului inainte de publicare.
7. **La confirmare, publica automat** folosind tooling-ul admin existent (POST `/api/admin/articole`, apoi PUT `/api/admin/qa-articol/[slug]`), la fel ca la fluxul "execută content nou".
8. **Verifica** la final ca articolul apare corect pe site (categorie, imagine, FAQ vizibil).

Nu publica nimic fara confirmarea explicita a userului pe fiecare draft.
