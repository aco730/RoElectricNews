import openpyxl, os
from openpyxl.styles import Font, Alignment, Border, Side

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = f"{ROOT}/electric-news-calendar-editorial.xlsx"

ARTICLE_QA = [
    ("legea-160-2026-a-intrat-in-vigoare-compensare-lunara-pentru-prosumatori-ce-se-sc", [
        ("Când a fost promulgată Legea 160/2026?", "Pe 23 iulie 2026, de președintele Nicușor Dan, după ce CCR a respins obiecția de neconstituționalitate pe 21 iulie."),
        ("Pot folosi surplusul de la panouri ca să plătesc gazul?", "Da, dacă ai contract de gaze la același furnizor ca cel de energie electrică."),
        ("Compensarea se aplică doar la locul unde am panourile montate?", "Nu — poate acoperi toate locurile de consum de la același furnizor, nu doar cel cu sistemul fotovoltaic."),
        ("Câți prosumatori existau în România la data articolului?", "332.684, cu o putere instalată totală de 3.789 MW, conform ANRE (30 aprilie 2026)."),
        ("De ce nu se aplică încă efectiv compensarea lunară?", "Pentru că ANRE trebuie să adopte normele de aplicare — până atunci drepturile din lege există pe hârtie, dar sunt inoperante."),
    ]),
    ("casa-verde-baterii-2026-buget-de-400-milioane-lei-aprobat-de-guvern-cine-poate-a", [
        ("Cât e bugetul Casa Verde Baterii 2026?", "400 de milioane de lei, aprobat de Guvern, dedicat exclusiv stocării."),
        ("Se mai subvenționează panouri fotovoltaice noi prin acest program?", "Nu — componenta de finanțare pentru panouri a fost eliminată, al doilea an consecutiv."),
        ("De ce a redus statul accentul pe panouri, în favoarea bateriilor?", "Ministra Mediului a invocat presiunea tot mai mare pe rețea la orele de vârf de producție solară."),
        ("Ce spune APCE despre acest buget?", "Îl consideră „inacceptabil și nerealist” și cere o majorare de minimum 50%."),
        ("Sunt cunoscute criteriile exacte de eligibilitate?", "Nu încă — la data articolului, ghidul de finanțare al AFM cu criteriile exacte nu era publicat."),
    ]),
    ("matter-in-2026-ce-produse-noi-compatibile-au-aparut-si-de-ce-conteaza-pentru-cas", [
        ("Câte dispozitive Matter noi pregătește IKEA?", "Peste 20, anunțate din iulie 2025, așteptate la începutul lui 2026."),
        ("Ce produse IKEA au fost deja identificate cu certificare Matter?", "Un întrerupător cu rotiță, un senzor temperatură/umiditate, un monitor de calitate a aerului, un senzor de mișcare, un senzor de ușă/fereastră și două prize inteligente."),
        ("Ce alte categorii de produse urmează să primească certificare Matter?", "Roboți aspiratori, mașini de spălat/uscătoare, stații de încărcare auto și invertoare fotovoltaice."),
        ("Până când vrea industria ca majoritatea produselor smart home să fie Matter?", "Până în 2027, conform foii de parcurs a Connectivity Standards Alliance."),
        ("De ce contează IKEA specific, mai mult decât alt brand?", "Pentru că a fost mereu punctul de intrare ieftin în smart home, iar extinderea catalogului Matter arată că standardul acoperă acum categorii utile, nu doar iluminat."),
    ]),
    ("compensare-cantitativa-vs-compensare-lunara-ce-inseamna-noua-lege-pentru-factura", [
        ("Care e diferența reală dintre compensare cantitativă și compensare lunară?", "Cantitativă e principiul (surplusul scade din consum), lunară e ritmul nou de calcul, introdus de Legea 160/2026."),
        ("Ce trei componente separate apar acum pe factură?", "Consumul din rețea, cât din producție ți-a acoperit consumul propriu, și cât ai livrat în plus peste consum."),
        ("Pot folosi surplusul pentru gaze la orice putere instalată?", "Nu — doar pentru sisteme sub 27 kW, dacă ai gaz și electricitate la același furnizor."),
        ("Cât timp rămân valabile aceste reguli de compensare?", "Garantate prin lege până la 31 decembrie 2030, pentru puteri sub 200 kW."),
        ("Ce se întâmplă după 2030?", "Prosumatorii trec la un regim bazat pe prețul de piață (PZU mediu ponderat), nu pe compensarea cantitativă actuală."),
    ]),
    ("anre-trebuie-sa-actualizeze-metodologia-de-comercializare-a-energiei-prosumatori", [
        ("Ce termen are ANRE pentru noua metodologie?", "60 de zile de la 26 iulie 2026 — aproximativ 24 septembrie 2026."),
        ("De ce nu funcționează compensarea lunară deja, deși legea a intrat în vigoare?", "Pentru că furnizorii nu pot procesa efectiv calculul fără metodologia ANRE care stabilește mecanismul exact."),
        ("Legea se aplică automat contractelor deja existente?", "Da, tuturor contractelor active la 26 iulie 2026, fără renegociere."),
        ("Cât timp rămâne valabilă opțiunea aleasă pentru destinația surplusului?", "Minimum 12 luni de la semnare."),
        ("Ce ar trebui să facă un prosumator până pe 24 septembrie?", "Să aștepte și să urmărească periodic comunicatele ANRE — nu există altă acțiune posibilă până la metodologie."),
    ]),
    ("peste-280000-de-prosumatori-si-3100-mw-instalati-in-romania-ce-arata-cifrele", [
        ("Câți prosumatori avea România la ultima raportare ANRE?", "332.684, cu 3.789 MW putere instalată totală, aprilie 2026."),
        ("Ce procent din prosumatori sunt firme, nu gospodării?", "Aproximativ 10%."),
        ("Cât e capacitatea combinată parcuri + prosumatori?", "Peste 7.000 MW, suficient ca solarul să devină a doua sursă de generare din România."),
        ("Care a fost cel mai mare nivel de producție solară instantanee înregistrat?", "1.866 MW, pe 16 iunie 2025 la ora 12:33, măsurat de Transelectrica."),
        ("Cât de mult mai poate crește capacitatea până în 2030?", "Ținta de piață e depășirea pragului de 10.000 MW, cu încă 2.500 MW estimați doar în 2026."),
    ]),
    ("comunitati-de-energie-cum-functioneaza-partajarea-curentului-intre-vecini", [
        ("Ce condiție e obligatorie pentru funcționarea oficială a unei comunități de energie?", "Înscrierea în Registrul național al comunităților de energie aprobat de ANRE."),
        ("Poate beneficia de energie cineva fără panouri proprii?", "Da — un membru fără acoperiș potrivit poate primi energie de la ceilalți membri ai comunității."),
        ("Cine poate face parte dintr-o comunitate de energie?", "Persoane fizice, autorități publice, UAT-uri, IMM-uri și asociații sau alte persoane juridice."),
        ("La ce scară pot funcționa aceste comunități?", "De la bloc sau cartier, până la comună, sat sau zonă industrială."),
        ("Ce lipsește încă, la momentul articolului?", "Cifre concrete despre comunități deja înregistrate și proceduri pas-cu-pas pentru inițierea uneia noi."),
    ]),
    ("sisteme-hibride-on-off-grid-de-ce-creste-cererea-pentru-stocare-in-2026", [
        ("Ce e „clientul activ”, conceptul introdus în ianuarie 2026?", "Un consumator care produce, consumă, stochează, vinde sau partajează energie fără ca asta să-i fie activitate principală."),
        ("Ce procent din energia solară ajunge consumat direct, fără baterie?", "Doar 30-35% — restul se duce în rețea, compensat la preț mai mic."),
        ("Cât crește autoconsumul cu o baterie bine dimensionată?", "La 80-95%, aproape dublând economia lunară estimată."),
        ("Ce face diferit un invertor hibrid față de unul on-grid clasic?", "Gestionează simultan panourile și bateria, plus funcția de backup la pană de curent."),
        ("Câte cicluri de încărcare oferă tehnologia LFP recomandată?", "Peste 6.000 de cicluri la 90% descărcare, echivalentul a 15+ ani de utilizare."),
    ]),
    ("cat-costa-inlocuirea-instalatiei-electrice-la-o-casa-ghid-de-manopera-pe-etape", [
        ("Care e prima etapă a înlocuirii instalației electrice?", "Proiectarea — stabilirea circuitelor, poziției tabloului și traseelor de cablu, conform I7."),
        ("Cât poate dura etapa de spargere și trasee?", "De la câteva zile la două-trei săptămâni, în funcție de complexitate."),
        ("Ce trebuie să aibă obligatoriu tabloul nou montat?", "Disjunctoare și diferențiale (RCD/DDR) pe fiecare circuit relevant."),
        ("Ce verificări se fac la final?", "Măsurători de rezistență de izolație, testarea fiecărui diferențial și, ideal, un proces verbal de recepție."),
        ("Care sunt cei trei factori care influențează cel mai mult costul total?", "Suprafața casei, gradul de spargere necesar și calitatea materialelor alese."),
    ]),
    ("peste-15-miliarde-eur-pentru-scheme-dedicate-energiei-in-2026-ce-programe-sunt-d", [
        ("Câte programe de finanțare distincte sunt disponibile în 2026?", "Șase, cu buget total de peste 1,5 miliarde de euro."),
        ("Cât e alocat pentru unitățile administrativ-teritoriale?", "Peste 650 de milioane de euro — peste 500 milioane pentru regenerabile și baterii, plus 150 milioane exclusiv pentru stocare."),
        ("Cât se acordă per MW fotovoltaic instalat, ca reper standardizat?", "1 milion de euro per MW, sau 1,3 milioane per MW cu stocare inclusă."),
        ("Ce program vizează companiile pentru echipamente de producție?", "PRO-INFRA, cu 200 de milioane de euro, finanțare de până la 15 milioane per beneficiar."),
        ("Cât e alocat pentru infrastructura de încărcare electrică?", "250 de milioane prin e-MOVE RO, din care 149 milioane combină stațiile de încărcare cu producția regenerabilă."),
    ]),
    ("lansari-recente-de-produse-smart-home-ce-merita-urmarit", [
        ("Ce mișcare recentă domină segmentul accesibil de smart home?", "Peste 20 de dispozitive Matter noi de la IKEA, așteptate la începutul lui 2026."),
        ("Ce categorii noi de produse au fost adăugate în foaia de parcurs Matter?", "Camere de supraveghere (din 2025), roboți aspiratori, mașini de spălat/uscătoare, stații de încărcare auto și invertoare fotovoltaice."),
        ("Până când vizează industria acoperirea majorității categoriilor cu Matter?", "Până în 2027."),
        ("Ce ar trebui verificat înainte de orice achiziție nouă smart home?", "Prezența certificării Matter, ca să nu rămâi blocat într-un ecosistem închis."),
        ("De ce contează asta pentru cititorii Electric NEWS specific?", "Pentru că invertoarele fotovoltaice intră și ele în foaia de parcurs Matter, relevant pentru case cu panouri."),
    ]),
    ("lifepo4-vs-alte-tehnologii-de-baterii-ghid-pentru-cumparatori", [
        ("Câte cicluri de încărcare suportă o baterie LiFePO4?", "Între 5.000 și peste 8.000 de cicluri, în funcție de brand și calitate."),
        ("Ce dezavantaj are Li-Ion „clasic” față de LiFePO4 pentru o casă?", "Risc termic mai ridicat și, în general, cost mai mare per kWh la aplicații staționare."),
        ("De ce e tot mai rar aleasă bateria plumb-acid pentru instalații noi?", "Durată de viață mult mai scurtă, performanță redusă la descărcări adânci și spațiu mai mare necesar."),
        ("De ce costă Huawei LUNA2000 de patru ori mai mult decât Deye, la aceeași tehnologie?", "Diferența vine din calitatea BMS-ului, integrarea cu invertorul și durata garanției, nu din chimia bateriei."),
        ("Ce decizie contează mai mult azi — tehnologia sau brandul?", "Brandul și capacitatea — LiFePO4 e deja alegerea implicită rezonabilă pentru orice instalație nouă."),
    ]),
    ("siguranta-electrica-cele-mai-frecvente-cauze-de-incendii-din-instalatii-vechi", [
        ("Ce procent din incendiile din România sunt cauzate de instalații electrice defecte?", "28,84% — 5.095 din 17.667 de intervenții înregistrate într-un an."),
        ("Ce cauze tehnice stau cel mai des în spatele acestor incendii?", "Conductoare strivite, izolație deteriorată de cuie/șuruburi, îmbătrânirea firelor și conexiuni slăbite în timp."),
        ("De ce nu reacționează o siguranță automată clasică la un arc electric de joasă intensitate?", "Pentru că protejează la suprasarcină și scurtcircuit, nu la acest tip specific de defect."),
        ("Ce dispozitiv e recomandat special pentru acest gol de protecție?", "AFDD (Arc Fault Detection Devices), deja standard în alte țări europene."),
        ("De la ce vechime a instalației crește semnificativ riscul real?", "Peste 20-25 de ani, sau la instalații nedocumentate."),
    ]),
    ("parcurile-fotovoltaice-au-devenit-a-doua-sursa-de-generare-a-energiei-din-romani", [
        ("Ce eveniment a marcat depășirea eolianului de către solar?", "Un parc fotovoltaic de 135 MW a primit licența de funcționare comercială în noiembrie, ducând capacitatea parcurilor la circa 3.249 MW."),
        ("Cât e capacitatea fotovoltaică totală a României, parcuri plus prosumatori?", "Peste 7.000 MW."),
        ("Care a fost recordul de producție solară instantanee?", "1.866 MW, pe 16 iunie 2025, ora 12:33, conform Transelectrica."),
        ("Cât de mult mai poate crește capacitatea până în 2030?", "Peste 10.000 MW, cu 2.500 MW estimați doar în 2026."),
        ("Ce efect are această creștere asupra priorității de finanțare a statului?", "A mutat prioritatea spre stocare prin baterii, nu spre subvenții noi pentru panouri."),
    ]),
    ("cum-citesti-factura-la-energie-ca-prosumator-compensare-tarife-tva", [
        ("Ce arată distinct factura unui prosumator?", "Energia consumată din rețea și energia livrată în rețea, separat, plus rezultatul compensării."),
        ("Ce componente reglementate separate conține tariful, dincolo de energia activă?", "Tariful de distribuție, tariful de transport BINOM și contribuția pentru certificate verzi."),
        ("Se aplică TVA și la energia compensată?", "Da — compensarea nu schimbă regimul de TVA aplicat facturii finale."),
        ("Pe ce interval se calculează compensarea, de regulă?", "Pe intervalul de facturare curent, nu instantaneu."),
        ("Ce ar trebui să fac dacă nu înțeleg o factură specifică?", "Să contactez direct furnizorul, cu cerere explicită de detaliere a modului de calcul."),
    ]),
    ("prize-intrerupatoare-tablouri-ghid-de-inlocuire-pas-cu-pas-pentru-o-casa-mai-sig", [
        ("Care e primul pas recomandat, dacă bugetul nu permite totul deodată?", "Tabloul electric — siguranța centrală a întregii instalații."),
        ("Cum verific rapid dacă o priză are împământare funcțională?", "Verific dacă are cele trei găuri standard cu contact metalic vizibil de împământare."),
        ("Ce zone au prioritate după tablou?", "Prizele și circuitele din baie și bucătărie, unde riscul de electrocutare e cel mai mare."),
        ("Ce verificare finală confirmă că înlocuirea a rezolvat problema de siguranță?", "Măsurarea rezistenței de izolație și testarea funcțională a fiecărui diferențial, de către un electrician autorizat."),
        ("Trebuie schimbat tot cablajul odată cu prizele?", "Nu neapărat — o înlocuire țintită a prizelor/tabloului aduce deja un salt mare de siguranță, fără recablare completă."),
    ]),
    ("legea-prosumatorilor-2026-declarata-constitutionala-de-ccr-ce-inseamna-in-practi", [
        ("Când a respins CCR obiecția de neconstituționalitate?", "Pe 29 aprilie 2026, dar motivarea scrisă a fost publicată abia pe 21 iulie 2026."),
        ("Ce mecanisme devin obligatorii legal prin această decizie?", "Compensarea cantitativă, plata gazului din surplus (sub 27 kW) și compensarea la mai multe proprietăți."),
        ("Cât a durat parcursul legislativ al legii, în total?", "Aproape doi ani în Parlament, plus o cerere de reexaminare prezidențială."),
        ("Până când e garantat prin lege mecanismul de compensare?", "Până la 31 decembrie 2030."),
        ("Ce se schimbă după acel termen?", "Trecerea la un regim de preț bazat pe piață (media ponderată PZU), nu pe compensarea cantitativă actuală."),
    ]),
    ("automatizari-utile-pentru-case-cu-panouri-fotovoltaice-cum-optimizezi-consumul", [
        ("Care e cea mai directă automatizare pentru o casă cu panouri?", "Programarea consumatorilor „amânabili” să pornească automat în intervalul de producție solară maximă."),
        ("De ce e boilerul electric cel mai eficient candidat pentru automatizare?", "Pentru că energia termică acumulată se păstrează câteva ore, eliminând nevoia de reîncălzire seara din rețea."),
        ("Ce ordine de prioritate setează un invertor hibrid, de regulă?", "Încarcă mai întâi bateria din surplus, apoi consumatorii amânabili, abia apoi trimite excesul în rețea."),
        ("Ce se automatizează la nivelul climatizării?", "Preîncălzirea sau prerăcirea locuinței în orele de producție solară maximă."),
        ("Care e punctul de plecare realist pentru majoritatea caselor?", "Identificarea a 2-3 consumatori mari și amânabili (boiler, mașină de spălat, încărcare auto) și programarea lor condiționată."),
    ]),
    ("anre-pregateste-metodologia-noua-pentru-vanzarea-energiei-de-la-prosumatori-pana", [
        ("Ce segment nou de putere reglementează explicit Legea 160/2026?", "200-400 kW, zonă anterior într-o zonă gri a reglementării."),
        ("Cum se calculează prețul de achiziție pentru acest segment?", "Ca preț mediu ponderat pe Piața pentru Ziua Următoare (PZU), cu regularizare financiară ulterioară."),
        ("De ce ar putea fi dezavantajos acest regim față de compensarea cantitativă?", "Pentru că prețul PZU poate fi sub prețul din contractul propriu, în anumite condiții de piață."),
        ("Ce termen are ANRE pentru metodologia acestui segment?", "60 de zile de la 26 iulie 2026, deci în jurul datei de 24 septembrie."),
        ("Cui contează cel mai mult această metodologie?", "Dezvoltatorilor de proiecte fotovoltaice medii, între instalația casnică și parcul comercial mare."),
    ]),
    ("apce-propune-tva-zero-pentru-sistemele-fotovoltaice-si-baterii-ce-sanse-are-prop", [
        ("Pentru ce sisteme cere APCE TVA 0%?", "Sisteme fotovoltaice până la 27 kW, baterii de stocare și componente esențiale de instalare."),
        ("Ce directivă UE invocă drept bază legală?", "Directiva 2022/542, deja aplicată în Germania din ianuarie 2023."),
        ("Care e impactul anual estimat de APCE, dacă propunerea trece?", "96.000 de instalații noi, 768 MW capacitate nouă și 614 milioane de euro investiții private."),
        ("Cât costă bugetar propunerea, în TVA necolectat?", "Aproximativ 129 de milioane de euro anual."),
        ("Când vrea APCE să propună acest pachet legislativ?", "În sesiunea parlamentară de toamnă — șansele reale de adoptare rămân, deocamdată, necunoscute."),
    ]),
    ("programul-afm-baterii-2026-mai-putini-beneficiari-si-posibile-probleme-de-legali", [
        ("Ce condiție de eligibilitate a propus ministra Mediului?", "Doar bateriile fabricate sau asamblate în Europa să fie eligibile pentru finanțare."),
        ("Cu cât ar putea costa mai mult sistemele europene față de cele asiatice?", "Între 40% și 130% mai mult, potrivit APCE."),
        ("De ce ar însemna asta mai puțini beneficiari, nu mai mulți?", "Pentru că bugetul fix (400 milioane lei) ar finanța mai puține instalații la prețuri mai mari."),
        ("Ce problemă legală ridică APCE?", "Posibila încălcare a liberei circulații a mărfurilor și a principiului nediscriminării pe piața unică UE."),
        ("Ce a cerut APCE Ministerului, înainte de lansarea programului?", "Justificarea legală a restricției și o analiză de compatibilitate cu legislația europeană."),
    ]),
    ("casa-verde-fotovoltaic-a-fost-eliminat-afm-devine-finantator-anghel-saligny-2-ce", [
        ("Unde s-a dus bugetul programului Casa Verde Fotovoltaic?", "1,5 miliarde de lei au fost redirecționate către programul de sprijin pentru apă-canal al primarilor."),
        ("Câte familii beneficiaseră anterior de acest program?", "Peste 100.000."),
        ("Ce sumă rămâne pentru bateriile prosumatorilor din bugetul de energie?", "400 de milioane de lei, considerată insuficientă de APCE."),
        ("Ce altă destinație primește din bugetul rămas?", "250 de milioane de lei merg către împăduriri."),
        ("Ce cere APCE ca reacție la această schimbare?", "Reintroducerea Casa Verde Fotovoltaic și majorarea cu minimum 50% a bugetului pentru stocare."),
    ]),
    ("de-ce-platim-certificate-verzi-in-factura-de-energie-si-cat-timp-vor-mai-exista", [
        ("Prin ce lege a fost introdus mecanismul certificatelor verzi?", "Legea 220/2008."),
        ("Pentru cât timp primește o centrală dreptul la certificate verzi?", "Maximum 15 ani de la punerea în funcțiune, nu pe termen nelimitat."),
        ("Când ies din schemă primele proiecte, cele mai vechi?", "Între 2026 și 2027, iar ultimele în jurul lui 2030-2032."),
        ("Primesc prosumatorii compensații prin certificate verzi?", "Nu — legea nu îi consideră „producători” în sensul acestui mecanism."),
        ("Mecanismul se extinde sau se restrânge în timp?", "Se restrânge — proiectele noi nu mai intră deloc în sistem de la un moment dat încolo."),
    ]),
    ("cine-controleaza-invertorul-tau-disputa-dintre-distribuitori-transelectrica-si-p", [
        ("Ce cer distribuitorii și Transelectrica de la prosumatori?", "Acces și control asupra invertoarelor instalate, invocând securitatea și stabilitatea rețelei."),
        ("Ce spune explicit APCE despre această cerere?", "„Nu vom accepta ca nimeni să acceseze invertoarele noastre fără acordul nostru expres.”"),
        ("Ce ar însemna practic acceptarea cererii distribuitorilor?", "Pierderea autonomiei prosumatorilor, cu posibilitatea limitării de la distanță a producției proprii."),
        ("Există un asemenea mecanism de control în alte țări europene?", "Nu, potrivit APCE."),
        ("Ce a anunțat APCE că va face dacă demersul avansează?", "Va lua în calcul acțiuni legale, atât la nivel național cât și european."),
    ]),
    ("comunitatile-de-energie-sunt-recunoscute-prin-lege-dar-inregistrarea-la-anre-dur", [
        ("Cu cât întârziere a publicat ANRE procedura de înregistrare?", "9 luni peste termenul legal, care era noiembrie 2025 — procedura a apărut abia pe 25 iunie 2026."),
        ("Ce rol avea ANRE în proiectul inițial, respins de APCE?", "Un rol de „judecător”, care evalua și decidea practic cine merită să existe ca și comunitate."),
        ("Ce include procedura finală, adoptată în iunie 2026?", "Doar înregistrarea propriu-zisă, notificări la schimbări de membri și riscul de radiere pentru modificări nenotificate."),
        ("Pe ce model e inspirată procedura finală?", "Pe modelul belgian, considerat unul dintre cele mai restrictive din Europa."),
        ("Cum a reacționat APCE la varianta finală?", "Nu felicită ANRE pentru simpla conformare, dar recunoaște că presiunea civică a dus la o procedură mai funcțională."),
    ]),
    ("bateriile-cu-litiu-explicate-simplu-ghid-pentru-prosumatori", [
        ("Ce imagine mentală simplă explică o baterie cu litiu?", "O „capcană pentru electroni” — energia externă îi împinge într-un electrod de grafit unde rămân prizonieri."),
        ("De ce nu pot electronii să se întoarcă direct prin interiorul bateriei?", "Electrolitul acționează ca un izolator electric perfect care le blochează drumul direct."),
        ("Cum ies electronii din baterie ca să producă curent?", "Printr-un circuit exterior — cabluri, invertor, aparate — pe drumul de întoarcere spre celălalt electrod."),
        ("Ce rol are ionul de litiu în acest proces?", "E „momeala” încărcată pozitiv care echilibrează sarcina electronilor, altfel respinși reciproc."),
        ("Bateria creează electroni noi?", "Nu — funcționează ca o pompă, dând energie potențială electronilor deja existenți în materialele conductoare."),
    ]),
    ("puterea-instalata-in-bateriile-prosumatorilor-a-depasit-capacitatea-de-stocare-c", [
        ("Cât e capacitatea centralizată de stocare a României?", "Aproximativ 600 MW, din care jumătate aparține unui singur furnizor privat."),
        ("Cât e puterea instalată în bateriile prosumatorilor, la sfârșitul lui 2025?", "Estimată tot la circa 600 MW — egalând capacitatea centralizată."),
        ("Ce spune APCE despre precizia acestei estimări?", "Că datele oficiale o subestimează — realitatea ar depăși 800 MW."),
        ("Ce măsoară, de fapt, puterea nominală a unui acumulator?", "Rata maximă la care bateria poate descărca energie, nu doar cât poate stoca."),
        ("Ce argument practic rezultă din această comparație?", "Că prosumatorii au construit, dispersat, o capacitate reală de sprijin a rețelei la vârfuri de consum."),
    ]),
    ("cinci-masuri-care-ar-putea-reduce-facturile-la-energie-fact-check-pe-propunerile", [
        ("Care e prima măsură propusă de APCE?", "Eliminarea contribuției pentru cogenerare, o taxă aplicată de 14 ani, fără să fie cerută de directiva europeană."),
        ("Ce TVA propune APCE pentru componentele fotovoltaice?", "5%, invocând Directiva UE 2022/542 și exemple deja aplicate în alte țări UE."),
        ("Care dintre cele cinci măsuri a devenit deja lege?", "Compensarea lunară a surplusului, prin Legea 160/2026."),
        ("Ce cere a patra măsură, despre fotovoltaicele de balcon?", "Eliminarea barierelor legislative pentru kituri de balcon și proiecte colective la blocuri."),
        ("Cât a încasat Transelectrica pentru surplusul prosumatorilor, potrivit APCE?", "Peste 46 de milioane de euro în 2024-2025, pentru un „serviciu neprestat”."),
    ]),
    ("anre-reglementeaza-comunitatile-de-energie-si-notificarea-la-80-din-consumul-lun", [
        ("Ce ordin a publicat ANRE pe 30 iunie 2026?", "Un ordin care modifică Regulamentul de Furnizare și stabilește cadrul complet pentru comunitățile de energie."),
        ("Ce comunități sunt exceptate de la licența ANRE?", "Locațiile neconectate la rețea, condominiile cu autoconsum 100% și ONG-urile de utilitate publică."),
        ("Ce obligație nouă au furnizorii de la 1 octombrie 2026?", "Să ofere gratuit un cont online cu istoric de consum pe 3 ani, facturi și grafice comparative."),
        ("Ce notificare automată primesc consumatorii prin acest cont?", "O alertă când consumul lunar ajunge la 80% din cel estimat."),
        ("Ce schimbare privește taxele de reziliere anticipată?", "Trebuie comunicate clar înainte de semnare și nu pot depăși pierderea economică reală a furnizorului, dovedită de acesta."),
    ]),
    ("certificate-verzi-2027-cum-a-estimat-anre-impactul-in-factura-consumatorilor", [
        ("Ce valoare a stabilit ANRE pentru impactul certificatelor verzi în 2027?", "14,5 euro pe MWh, aceeași valoare propusă inițial."),
        ("Ce algoritm alternativ exista, respins de ANRE?", "Unul care indica 13,03 euro/MWh."),
        ("Ce prag de excedent a folosit ANRE pentru justificarea deciziei?", "Excedentul estimat 2027 (97%) comparat cu media istorică (123%) — sub medie, deci valoarea inițială rămâne justificată."),
        ("Cât reprezintă taxa pentru un consumator cu 2.500 kWh/an?", "Aproximativ 36-37 euro pe an."),
        ("Ce trebuie să se întâmple pentru ca decizia să devină definitivă?", "Aprobarea Guvernului, în termen de 60 de zile de la comunicat."),
    ]),
    ("anre-a-retras-prima-licenta-unui-furnizor-din-istoria-institutiei-grenerg-ce-tre", [
        ("Câte locuri de consum au fost afectate de retragerea licenței GRENERG?", "22.564, dintre care 22.102 clienți casnici."),
        ("Cât însumează amenzile aplicate GRENERG?", "1.165.000 de lei, pentru peste 100 de abateri documentate."),
        ("Ce a declarat președintele ANRE despre gravitatea măsurii?", "Că retragerea licenței „este cea mai severă măsură pe care ANRE o poate dispune”."),
        ("Ce se întâmplă cu clienții afectați, concret?", "Sunt preluați automat de furnizorul de ultimă instanță, fără întrerupere de curent."),
        ("Unde pot compara alte oferte cei care vor un furnizor ales activ?", "Pe platforma oficială www.posf.ro."),
    ]),
    ("anre-schimba-regulile-de-racordare-garantia-creste-de-la-5-la-20-ce-presupune-pe", [
        ("De la cât la cât crește garanția de racordare?", "De la 5% la 20% din valoarea tarifului de racordare."),
        ("Ce garanții noi introduce ANRE, care nu existau înainte?", "20 €/kW pentru licitația de alocare a capacităților și 30 €/kW pentru Autorizația de Înființare."),
        ("Ce a spus președintele ANRE despre motivul schimbării?", "Că vrea „MW reali, racordați în rețea, nu MW pe hârtie”."),
        ("Când e programată licitația de alocare a capacităților?", "Toamna anului 2026."),
        ("Afectează aceste reguli un prosumator casnic obișnuit?", "Proiectele mici rămân, în principiu, mai puțin afectate — regulile vizează mai ales investițiile care depășesc pragul unei instalații rezidențiale standard."),
    ]),
    ("rcd-ddr-explicat-diferenta-dintre-protectia-la-atingere-directa-si-indirecta", [
        ("Ce diferență e între atingerea directă și cea indirectă?", "Directă e contactul cu o piesă normal sub tensiune; indirectă e contactul cu o piesă care n-ar trebui să fie sub tensiune, dar a ajuns accidental."),
        ("Ce prag de curent declanșează, de regulă, un RCD casnic?", "30 mA, suficient de sensibil ca să protejeze o persoană."),
        ("De ce nu e suficientă o siguranță obișnuită pentru protecția la electrocutare?", "Pentru că reacționează la supracurent, nu la o scurgere mică, dar letală pentru o persoană."),
        ("Unde e obligatorie protecția diferențială conform I7?", "Băi, bucătării, prize exterioare, orice zonă cu umiditate sau contact posibil cu apa."),
        ("Cum testez rapid dacă am protecție diferențială montată?", "Caut butonul „T”/„Test” pe carcasa dispozitivului din tablou — apăsat, ar trebui să întrerupă instant circuitul."),
    ]),
    ("ce-poti-face-diy-la-instalatia-electrica-si-ce-este-strict-interzis-fara-autoriz", [
        ("Pot înlocui singur un bec sau un corp de iluminat existent?", "Da, cu alimentarea oprită de la siguranță, fără modificare de circuit."),
        ("Pot schimba o priză deteriorată cu una identică?", "Da, atât timp cât nu schimbi traseul de cablu, doar piesa vizibilă."),
        ("Pot interveni singur la tabloul electric?", "Nu, niciodată — orice montare/mutare de disjunctoare sau RCD e strict pentru electrician autorizat."),
        ("Pot adăuga un circuit nou pe cont propriu?", "Nu — necesită cablare, dimensionare corectă și conectare la tablou, rezervate legal electricienilor autorizați."),
        ("De ce sunt periculoase mai ales greșelile din categoria „interzis”?", "Pentru că pot funcționa aparent normal luni sau ani, apoi eșua exact în momentul cu risc maxim."),
    ]),
    ("yellow-grid-cum-functioneaza-o-baterie-casnica-de-86-kwh-conectata-la-o-retea-vi", [
        ("Ce e Yellow Grid, mai exact?", "O platformă tip VPP (centrală electrică virtuală) care unește bateriile a zeci/sute de mii de prosumatori."),
        ("Din ce se compune bateria de 86 kWh descrisă în articol?", "66 kWh în 8 module externe de câte 8 kWh, plus 20 kWh dintr-un sistem interior."),
        ("Ce e Yellow Box?", "Dispozitivul de conectare la platformă, cu SIM 4G, izolat de rețeaua Wi-Fi a casei."),
        ("Cât poate câștiga un utilizator într-o seară, în exemplul din articol?", "Aproximativ 50-60 de lei, descărcând 60 kWh la un preț spot de aproape 1 leu/kWh."),
        ("Ce obstacol limitează profitabilitatea ciclurilor multiple zilnice?", "Taxa de distribuție, de 75-80 de bani pe kilowatt."),
    ]),
    ("camere-de-supraveghere-fara-wifi-si-fara-curent-cu-panou-solar-are-sens-pentru-o", [
        ("Ce modele EZVIZ sunt testate în articol?", "EZVIZ Lite (HB8 Lite 4G) și EZVIZ Pro (EB8)."),
        ("Cum funcționează camera fără Wi-Fi în zonă?", "Prin conexiune 4G independentă, cu upload în timp real către cloud."),
        ("Care e diferența de performanță nocturnă între cele două modele?", "Pro captează detalii clare la 4-10 metri în întuneric complet; Lite oferă doar imagine acceptabilă pe lumină slabă."),
        ("Cât a păstrat bateria modelului Lite după o noapte de funcționare?", "73% din capacitate."),
        ("Ce orientare are nevoie panoul solar pentru performanță optimă?", "Ideal spre sud, dar funcționează acceptabil și la est sau vest."),
    ]),
    ("instalatie-electrica-pentru-casa-noua-ce-nu-trebuie-ratat-inainte-de-turnarea-be", [
        ("Ce trebuie planificat înainte de turnarea fundației?", "Priza de pământ naturală și golurile tehnice pentru canalizare, internet și branșament electric."),
        ("Din ce se face priza de pământ recomandată?", "O centură din platbandă de 40x4 mm, prinsă mecanic de armătura fundației."),
        ("Ce tip de diferențial general e recomandat minim?", "Tip A (nu AC), 30 mA."),
        ("Ce spune articolul despre cablul din aluminiu?", "Că România rămâne una dintre puținele țări din regiune unde mai e acceptat, din motive de cost — cuprul e recomandarea corectă."),
        ("Cum trebuie făcute conexiunile între siguranțe?", "Cu bară de distribuție (pieptăn), nu cu fir liber."),
    ]),
    ("tabloul-electric-autorizatie-inaltime-de-montaj-si-cand-e-semn-de-pericol-daca-s", [
        ("E nevoie de autorizație de construcție pentru schimbarea tabloului?", "Nu, doar de un electrician autorizat ANRE — nu de un aviz de la primărie."),
        ("La ce înălțime standard se montează tabloul electric?", "Între 1,5 și 1,8 metri de la podea."),
        ("E corect să pun o siguranță de amperaj mai mare dacă sare des?", "Nu — reacția corectă e să identifici cauza (supraîncărcare sau aparat defect), nu să crești amperajul."),
        ("Când devine urgență electrică o siguranță care sare?", "Când sare aparent aleatoriu, la aparate diferite, sau apare miros de ars ori prize calde/decolorate."),
        ("Ce înseamnă dacă siguranța sare mereu la același aparat specific?", "Aparatul respectiv are probabil un defect și trebuie verificat sau înlocuit — nu e o urgență a instalației."),
    ]),
    ("casa-smart-de-la-zero-ce-inseamna-cat-costa-si-cum-incepi", [
        ("Cât costă un kit minimal de pornire pentru casă smart?", "Câteva sute de lei, pentru 2-3 prize/becuri inteligente și un hub de bază."),
        ("Trebuie neapărat cablare nouă pentru o casă smart?", "Nu — soluțiile Zigbee, Wi-Fi și Matter funcționează wireless, peste instalația existentă."),
        ("Ce sistem cere totuși cablare dedicată?", "KNX, gândit pentru case noi sau renovări majore."),
        ("Care e abordarea recomandată pentru un începător?", "Pe etape — o singură categorie (de regulă iluminatul), testată întâi cu 2-3 dispozitive."),
        ("Casa smart economisește bani doar prin instalare?", "Nu — beneficiul vine din folosirea activă a automatizării (termostate, programări), nu doar din control de la distanță."),
    ]),
    ("cum-functioneaza-panourile-fotovoltaice-ghid-pentru-incepatori", [
        ("Ce face, de fapt, invertorul unui sistem fotovoltaic?", "Transformă curentul continuu produs de panouri în curent alternativ compatibil cu priza din casă."),
        ("Cât produc panourile pe cer înnorat?", "Aproximativ 20-30% din producția maximă."),
        ("Cât spațiu pe acoperiș ocupă un sistem de 5-6 kW?", "Aproximativ 25-35 metri pătrați, bine orientat."),
        ("E nevoie de autorizație de construcție pentru montaj?", "Nu, în general, atâta timp cât nu afectează structura de rezistență — dar racordarea la rețea cere documentație separată."),
        ("Cât durează, de la decizie, până la panouri funcționale?", "Orientativ 2-3 luni, incluzând proiectare, aprobări și montaj."),
    ]),
]

def main():
    wb = openpyxl.load_workbook(XLSX)
    ws = wb["Q&A Articole"]
    body_font = Font(name="Arial", size=10)
    align_wrap = Alignment(wrap_text=True, vertical="top")
    thin = Side(style="thin", color="FFE5E9EE")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    row = ws.max_row + 1
    total = 0
    for slug, qa_list in ARTICLE_QA:
        for intrebare, raspuns in qa_list:
            ws.cell(row=row, column=1, value=slug)
            ws.cell(row=row, column=2, value=intrebare)
            ws.cell(row=row, column=3, value=raspuns)
            for col in range(1, 4):
                cell = ws.cell(row=row, column=col)
                cell.font = body_font
                cell.alignment = align_wrap
                cell.border = border
            row += 1
            total += 1

    wb.save(XLSX)
    print(f"Adăugate {total} întrebări noi, pentru {len(ARTICLE_QA)} articole.")

if __name__ == "__main__":
    main()
