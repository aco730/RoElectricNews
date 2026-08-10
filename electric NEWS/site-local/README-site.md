# Electric NEWS — site local de previzualizare

## Cum funcționează

Site-ul este generat automat din `electric-news-calendar-editorial.xlsx` (foaia "Calendar editorial"). Fiecare rând din Excel devine o pagină de articol reală, listată pe pagina categoriei ei și, dacă e printre cele mai recente, pe homepage.

Nimic nu e scris de mână direct în HTML — totul pornește din Excel, ca să rămână sincronizat.

## Cum se actualizează site-ul

De fiecare dată când se adaugă rânduri noi în Excel (manual sau prin skill-ul „adaugă-idee-electric-news”), site-ul trebuie regenerat ca să apară și acolo. Asta se întâmplă automat când lucrezi cu mine în chat — cer doar să spui „actualizează siteul” dacă nu se întâmplă singur.

Scripturile de regenerare sunt în `scripts/` (persistă alături de Excel):
- `scripts/build_site.py` — regenerează homepage + pagini categorie + pagini articol din Excel
- `scripts/gen_images.py` — regenerează cele 5 imagini generice de categorie (rulează doar dacă vrei să schimbi stilul imaginilor generice)
- `scripts/check_links.py` — verifică tot site-ul: niciun link intern mort, niciun link extern care nu există exact în Excel

## Cum înlocuiești o imagine

Fiecare articol are o imagine proprie la:
`assets/images/articole/<slug-articol>.jpg`

Implicit e o copie a imaginii generice a categoriei lui. Ca s-o schimbi, pune propria poză (același nume de fișier, extensie `.jpg`) peste cea existentă — la următoarea regenerare a site-ului, dacă fișierul există deja, **nu este suprascris automat**, deci poza ta rămâne.

Imaginile generice de categorie sunt în `assets/images/categorii/` (una per categorie).

## Linkuri către sursă

Fiecare articol de tip „Agregat" are la final un link exact către sursa din Excel (coloana „URL sursă"). Dacă acolo scrie „de documentat" sau „conținut propriu", articolul afișează asta clar, în loc de un link mort sau inventat.
