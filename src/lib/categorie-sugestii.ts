import type { ArticolMeta } from './articole';
import { categories } from '../data/categories';
import { normalizeazaTokeni } from './duplicate';

export interface SugestieCategorie {
	slug: string;
	name: string;
	scor: number;
	cuvinteCheie: string[];
}

export interface RezultatSugestii {
	articolSlug: string;
	titlu: string;
	categorieCurenta: string;
	sugestii: SugestieCategorie[];
}

function buildProfileToken(tokeni: Set<string>, profil: Map<string, number>, greutate: number) {
	for (const t of tokeni) {
		profil.set(t, (profil.get(t) ?? 0) + greutate);
	}
}

function construiesteProfileCategorii(articole: ArticolMeta[]): Map<string, Map<string, number>> {
	const profile = new Map<string, Map<string, number>>();
	for (const cat of categories) {
		const profil = new Map<string, number>();
		buildProfileToken(normalizeazaTokeni(cat.name), profil, 3);
		buildProfileToken(normalizeazaTokeni(cat.description), profil, 2);
		profile.set(cat.slug, profil);
	}
	for (const art of articole) {
		const profil = profile.get(art.categorie);
		if (!profil) continue;
		buildProfileToken(normalizeazaTokeni(art.title), profil, 1);
	}
	return profile;
}

function scoreazaTitlu(tokeniTitlu: Set<string>, profil: Map<string, number>): { scor: number; cuvinteCheie: string[] } {
	if (tokeniTitlu.size === 0 || profil.size === 0) return { scor: 0, cuvinteCheie: [] };

	let potrivire = 0;
	let maximPosibil = 0;
	const cuvinteCheie: string[] = [];

	for (const t of tokeniTitlu) {
		const greutate = profil.get(t) ?? 0;
		if (greutate > 0) {
			potrivire += greutate;
			cuvinteCheie.push(t);
		}
	}
	for (const g of profil.values()) maximPosibil += g;

	const normalizatDupaTitlu = potrivire / tokeniTitlu.size;
	const normalizatDupaProfil = maximPosibil > 0 ? potrivire / maximPosibil : 0;
	const scor = Math.min(1, normalizatDupaTitlu * 0.7 + normalizatDupaProfil * 3 * 0.3);

	return { scor, cuvinteCheie };
}

export function sugereazaCategorii(titlu: string, articole: ArticolMeta[], top = 3): SugestieCategorie[] {
	const profile = construiesteProfileCategorii(articole);
	const tokeniTitlu = normalizeazaTokeni(titlu);

	const rezultate: SugestieCategorie[] = categories.map((cat) => {
		const { scor, cuvinteCheie } = scoreazaTitlu(tokeniTitlu, profile.get(cat.slug)!);
		return { slug: cat.slug, name: cat.name, scor, cuvinteCheie };
	});

	return rezultate.sort((a, b) => b.scor - a.scor).slice(0, top);
}

export function sugereazaPentruToate(articole: ArticolMeta[], pragNepotrivire = 0): RezultatSugestii[] {
	const profile = construiesteProfileCategorii(articole);
	const rezultate: RezultatSugestii[] = [];

	for (const art of articole) {
		const tokeniTitlu = normalizeazaTokeni(art.title);
		const sugestii = categories
			.map((cat) => {
				const { scor, cuvinteCheie } = scoreazaTitlu(tokeniTitlu, profile.get(cat.slug)!);
				return { slug: cat.slug, name: cat.name, scor, cuvinteCheie };
			})
			.sort((a, b) => b.scor - a.scor)
			.slice(0, 3);

		const mai_bun = sugestii[0];
		if (mai_bun && mai_bun.slug !== art.categorie && mai_bun.scor >= pragNepotrivire) {
			rezultate.push({
				articolSlug: art.slug,
				titlu: art.title,
				categorieCurenta: art.categorie,
				sugestii,
			});
		}
	}

	return rezultate.sort((a, b) => (b.sugestii[0]?.scor ?? 0) - (a.sugestii[0]?.scor ?? 0));
}
