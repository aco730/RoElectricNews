import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ETICHETE_PATH = path.join(process.cwd(), 'src', 'data', 'etichete.json');

export interface Etichetă {
	slug: string;
	text: string;
	culoare: string;
}

function slugify(text: string): string {
	const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(DIACRITICS_RE, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40);
}

export async function getEtichete(): Promise<Etichetă[]> {
	const raw = await readFile(ETICHETE_PATH, 'utf-8');
	return JSON.parse(raw) as Etichetă[];
}

export async function saveEtichete(items: { slug?: string; text: string; culoare: string }[]): Promise<Etichetă[]> {
	const finale: Etichetă[] = items.map((it) => ({
		slug: it.slug || slugify(it.text),
		text: it.text,
		culoare: it.culoare || '#334155',
	}));
	await writeFile(ETICHETE_PATH, JSON.stringify(finale, null, 2) + '\n', 'utf-8');
	return finale;
}
