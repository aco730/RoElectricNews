export type NivelRisc = 'sigur' | 'atenție' | 'periculos';

export interface DefinitieScript {
	id: string;
	fisier: string;
	nume: string;
	descriere: string;
	risc: NivelRisc;
	avertisment?: string;
	argumente?: { nume: string; label: string; obligatoriu: boolean }[];
}

export const SCRIPTURI: DefinitieScript[] = [
	{
		id: 'regenereaza-portofoliu',
		fisier: 'regenereaza_portofoliu.py',
		nume: 'Regenerează portofoliu.json',
		descriere: 'Reconstruiește src/data/portofoliu.json din proiecte-portofoliu.json + portfolio_photos_source.json. Idempotent — sigur de rulat oricând, de exemplu după o editare manuală a fișierelor.',
		risc: 'sigur',
	},
	{
		id: 'add-photos',
		fisier: 'add_photos.py',
		nume: 'Procesează poze noi (poze-noi/)',
		descriere: 'Caută poze puse manual în poze-noi/<folder>/, generează thumbnail-uri și le adaugă în portofoliu. Dacă nu sunt poze noi, nu face nimic. Folosită automat și de formularul de upload din Portofoliu.',
		risc: 'sigur',
	},
	{
		id: 'sync-content',
		fisier: 'sync_content.py',
		nume: 'Sincronizare din continut-site.xlsx (legacy)',
		descriere: 'Regenerează articolele, categoriile și Q&A din vechiul Excel continut-site.xlsx, suprascriind fișierele curente.',
		risc: 'periculos',
		avertisment: 'Articolele/categoriile/FAQ sunt editate acum din panoul de admin, NU din acest Excel. Rularea acestui script ȘTERGE și regenerează src/content/articole/ din Excel — orice articol creat sau editat din admin care nu există și în Excel va fi PIERDUT.',
	},
	{
		id: 'delete-project',
		fisier: 'delete_project.py',
		nume: 'Șterge un șantier (linie de comandă)',
		descriere: 'Șterge definitiv un șantier de portofoliu după id. Recomandat: folosește butonul "Șterge șantierul definitiv" din pagina fiecărui proiect din Portofoliu — e mai sigur (confirmare vizuală, fără risc de a introduce id greșit).',
		risc: 'atenție',
		avertisment: 'Ireversibil. Scrie exact id-ul șantierului (coloana "id", vizibilă în /admin/portofoliu).',
		argumente: [{ nume: 'project_id', label: 'ID șantier', obligatoriu: true }],
	},
	{
		id: 'add-poze-sheet',
		fisier: 'add_poze_sheet.py',
		nume: 'Adaugă foaia "Poze" în Excel (migrare unică)',
		descriere: 'Script de migrare, rulat o singură dată la trecerea inițială pe Excel. Portofoliul nu mai depinde de Excel — nu ar trebui rulat din nou.',
		risc: 'periculos',
		avertisment: 'Script de migrare unică, deja executat istoric. Portofoliul funcționează acum independent de Excel. Rulează-l din nou doar dacă știi exact ce faci.',
	},
	{
		id: 'add-proiecte-sheet',
		fisier: 'add_proiecte_sheet.py',
		nume: 'Adaugă foaia "Proiecte" în Excel (migrare unică)',
		descriere: 'Script de migrare, rulat o singură dată la trecerea inițială pe Excel. Portofoliul nu mai depinde de Excel — nu ar trebui rulat din nou.',
		risc: 'periculos',
		avertisment: 'Script de migrare unică, deja executat istoric. Portofoliul funcționează acum independent de Excel. Rulează-l din nou doar dacă știi exact ce faci.',
	},
	{
		id: 'build-master-workbook',
		fisier: 'build_master_workbook.py',
		nume: 'Reconstruiește continut-site.xlsx (migrare unică)',
		descriere: 'Reconstruiește de la zero Excel-ul master din sursele vechi "electric NEWS". Rulat o singură dată la migrarea inițială.',
		risc: 'periculos',
		avertisment: 'Suprascrie complet continut-site.xlsx. Acest Excel nu mai e folosit de admin pentru articole/categorii/FAQ — rularea lui nu afectează site-ul live, dar poate pierde editări manuale făcute direct în Excel între timp.',
	},
	{
		id: 'extract-portfolio-photos',
		fisier: 'extract_portfolio_photos.py',
		nume: 'Extrage poze din portofoliul vechi (migrare unică)',
		descriere: 'Extrage datele de poze din exportul vechi de portofoliu și regenerează portfolio_photos_source.json de la zero.',
		risc: 'periculos',
		avertisment: 'Suprascrie complet portfolio_photos_source.json — pierzi toate notele, ascunderile și pozele adăugate ulterior prin admin. Script de migrare unică, deja executat istoric.',
	},
];

export function getScript(id: string): DefinitieScript | undefined {
	return SCRIPTURI.find((s) => s.id === id);
}
