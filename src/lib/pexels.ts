import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEST_DIR = path.join(process.cwd(), 'public', 'images', 'articole');

const STOPWORDS = new Set([
	'de', 'la', 'în', 'si', 'și', 'ce', 'pe', 'cu', 'un', 'o', 'ai', 'a', 'e', 'ca', 'sau',
	'nu', 'mai', 'din', 'pentru', 'care', 'cum', 'ghid', 'vs', 'este', 'sunt', 'noi', 'nou',
	'noua', 'nouă', 'cat', 'cât', 'costa', 'costă', 'cine', 'ce-i',
]);

export function extrageCuvinteCheie(titlu: string): string {
	const cuvinte = titlu
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 2 && !STOPWORDS.has(w));
	return cuvinte.slice(0, 3).join(' ');
}

export async function cautăImaginePexels(interogare: string, apiKey: string): Promise<string | null> {
	const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(interogare)}&per_page=1&orientation=landscape`;
	const res = await fetch(url, { headers: { Authorization: apiKey } });
	if (!res.ok) throw new Error(`Pexels a răspuns cu ${res.status}`);
	const data = await res.json();
	const foto = data.photos?.[0];
	if (!foto) return null;
	return foto.src?.large ?? foto.src?.medium ?? null;
}

export async function cautăImagineAlternativăPexels(
	interogare: string,
	apiKey: string,
	evităUrl?: string
): Promise<string | null> {
	const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(interogare)}&per_page=15&orientation=landscape`;
	const res = await fetch(url, { headers: { Authorization: apiKey } });
	if (!res.ok) throw new Error(`Pexels a răspuns cu ${res.status}`);
	const data = await res.json();
	const poze: string[] = (data.photos ?? [])
		.map((f: any) => f.src?.large ?? f.src?.medium)
		.filter((u: string | undefined): u is string => !!u);
	if (poze.length === 0) return null;

	const candidate = evităUrl ? poze.filter((u) => u !== evităUrl) : poze;
	const listaFinală = candidate.length > 0 ? candidate : poze;
	return listaFinală[Math.floor(Math.random() * listaFinală.length)];
}

export async function descarcăȘiSalvează(imgUrl: string, slug: string): Promise<string> {
	const res = await fetch(imgUrl);
	if (!res.ok) throw new Error(`Descărcarea imaginii a eșuat: ${res.status}`);
	const buffer = Buffer.from(await res.arrayBuffer());
	await mkdir(DEST_DIR, { recursive: true });
	const fileName = `${slug}.jpg`;
	await writeFile(path.join(DEST_DIR, fileName), buffer);
	return `/images/articole/${fileName}`;
}
