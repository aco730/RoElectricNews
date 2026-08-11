---
description: Proceseaza fisierele .txt noi din "execută content nou\youtube" (link YouTube + transcript) si genereaza automat articole
---

Scaneaza folderul `C:\Users\730\Desktop\sep\execută content nou\youtube` dupa fisiere `.txt` noi si proceseaza-le pe rand, unul cate unul, astfel:

1. **Listeaza fisierele .txt** din folder. Daca nu exista niciunul, anunta userul ca nu sunt fisiere noi si opreste-te.
2. **Pentru fiecare fisier**, in ordine:
   - Citeste continutul. **Prima linie = linkul YouTube**, restul fisierului = transcriptul.
   - Extrage `VIDEO_ID` din link pentru thumbnail: `https://img.youtube.com/vi/<VIDEO_ID>/maxresdefault.jpg`.
   - **Redacteaza articolul** in stil prietenos, obiectiv, informativ, non-politic si politically correct:
     - Nu folosi niciodata nume de partide politice sau afilieri politice explicite. Daca subiectul e politic, extrage doar faptele/masurile/reglementarile relevante, fara framing de tabara sau conflict politic.
     - **Titlu** clar, atractiv, specific.
     - **Continut** structurat pe sectiuni scurte, ~500-700 cuvinte, citibil in ~3 minute, cu elementele esentiale reinterpretate (nu copiere din transcript).
     - **Categorie** aleasa din `src/data/categories.json` (mapeaza subiectul la categoria cea mai potrivita; foloseste `reglementari-preturi` pentru legislatie/reglementari, `fotovoltaic` pentru solar/baterii, etc).
     - **FAQ**: 3-5 intrebari/raspunsuri relevante.
     - **Sursa**: `sursaNume` = numele canalului YouTube, `sursaUrl` = linkul din prima linie a fisierului.
   - **Prezinta draftul complet in chat** (titlu, continut, categorie, poza, sursa, FAQ) si **asteapta confirmarea explicita a userului inainte de publicare**. Nu trece la fisierul urmator fara confirmare pe cel curent.
   - **La confirmare, publica automat**:
     a. Verifica/porneste dev server-ul (`astro dev status`, altfel `astro dev --background`).
     b. Descarca thumbnail-ul in `public/images/articole/`.
     c. Autentifica-te la admin: `POST /api/admin/login` cu `password` din `.env` (`ADMIN_PASSWORD`) si header `Origin: http://localhost:4321`, salveaza cookie-ul de sesiune.
     d. Creeaza articolul via `POST /api/admin/articole` (title, categorie, data curenta, sursaNume, sursaUrl, imagine, continut).
     e. Salveaza FAQ via `PUT /api/admin/qa-articol/[slug]`.
     f. Daca articolul e primul nou creat in aceasta rulare de comanda, restarteaza dev server-ul (`astro dev stop` + `astro dev --background`) ca sa fie preluat de content collection, apoi verifica cu `curl` ca pagina `/blog/[slug]` raspunde 200.
   - **Muta fisierul .txt procesat** din `execută content nou\youtube` in `execută content nou\executate` (doar dupa publicare confirmata cu succes).
3. **La final**, rezuma userului cate articole au fost publicate si care fisiere au fost mutate.

Nu publica si nu muta niciun fisier fara confirmarea explicita a userului pe draftul respectiv.
