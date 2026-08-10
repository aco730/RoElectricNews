import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { listArticole } from './articole';

const CATEGORII_PATH = path.join(process.cwd(), 'src', 'data', 'categories.json');

export interface Categorie {
	slug: string;
	name: string;
	color: string;
	description: string;
	ascunsa: boolean;
}

function slugify(text: string): string {
	const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(DIACRITICS_RE, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

export async function getCategorii(): Promise<Categorie[]> {
	const raw = await readFile(CATEGORII_PATH, 'utf-8');
	return JSON.parse(raw) as Categorie[];
}

export async function saveCategorii(items: Partial<Categorie>[]): Promise<Categorie[]> {
	const existente = await getCategorii();
	const finale: Categorie[] = items.map((it) => {
		const anterioară = existente.find((e) => e.slug === it.slug);
		return {
			slug: it.slug || slugify(it.name || '') || `categorie-${Date.now()}`,
			name: it.name || anterioară?.name || '',
			color: it.color || anterioară?.color || '#334155',
			description: it.description ?? anterioară?.description ?? '',
			ascunsa: it.ascunsa ?? anterioară?.ascunsa ?? false,
		};
	});
	await writeFile(CATEGORII_PATH, JSON.stringify(finale, null, 2) + '\n', 'utf-8');
	return finale;
}

export async function numărArticolePerCategorie(): Promise<Record<string, number>> {
	const articole = await listArticole();
	const rezultat: Record<string, number> = {};
	for (const a of articole) {
		rezultat[a.categorie] = (rezultat[a.categorie] ?? 0) + 1;
	}
	return rezultat;
}
