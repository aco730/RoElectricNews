import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PROIECTE_PATH = path.join(ROOT, 'src', 'data', 'proiecte-portofoliu.json');
const PHOTO_SRC_PATH = path.join(ROOT, 'scripts', 'portfolio_photos_source.json');
const PORTOFOLIU_OUT_PATH = path.join(ROOT, 'src', 'data', 'portofoliu.json');
const THUMBS_DIR = path.join(ROOT, 'public', 'images', 'portofoliu', 'thumbs');

export interface Proiect {
	id: string;
	nume: string;
	album: string;
	locatie: string;
	note: string;
	dataDe: string;
	dataPana: string;
	ascuns: boolean;
	etichete: string[];
}

export interface Poza {
	id: string;
	album: string;
	project_id: string;
	date: string | null;
	thumb_s: string;
	thumb_l: string;
	nota: string;
	ascunsa: boolean;
}

interface PhotoSrc {
	photos: Poza[];
	projects_source: Record<string, { cover_id: string | null; count: number; date_from: string; date_to: string }>;
	albums: Record<string, string>;
}

async function readJson<T>(filePath: string): Promise<T> {
	return JSON.parse(await readFile(filePath, 'utf-8')) as T;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
	await writeFile(filePath, JSON.stringify(data), 'utf-8');
}

export async function getProiecte(): Promise<Proiect[]> {
	return readJson<Proiect[]>(PROIECTE_PATH);
}

export async function getPhotoSrc(): Promise<PhotoSrc> {
	return readJson<PhotoSrc>(PHOTO_SRC_PATH);
}

export async function regenereazăPortofoliuJson(): Promise<void> {
	const proiecte = await getProiecte();
	const photoSrc = await getPhotoSrc();

	const photosByProject = new Map<string, Poza[]>();
	for (const p of photoSrc.photos) {
		if (p.ascunsa) continue;
		const { ascunsa, ...rest } = p;
		const list = photosByProject.get(p.project_id) ?? [];
		list.push(rest as Poza);
		photosByProject.set(p.project_id, list);
	}

	const proiecteOut = [];
	for (const p of proiecte) {
		if (p.ascuns) continue;
		const coverInfo = photoSrc.projects_source[p.id] ?? {};
		const pozeProiect = photosByProject.get(p.id) ?? [];
		let cover = pozeProiect.find((f) => f.id === (coverInfo as any).cover_id)?.thumb_l ?? null;
		if (!cover && pozeProiect.length > 0) cover = pozeProiect[0].thumb_l;
		proiecteOut.push({
			id: p.id,
			nume: p.nume,
			album: p.album || '',
			locatie: p.locatie || '',
			note: p.note || '',
			dataDe: p.dataDe || '',
			dataPana: p.dataPana || '',
			etichete: p.etichete || [],
			poze: pozeProiect,
			cover,
		});
	}

	await writeJson(PORTOFOLIU_OUT_PATH, { albume: photoSrc.albums, proiecte: proiecteOut });
}

export async function actualizeazăProiect(id: string, câmpuri: Partial<Omit<Proiect, 'id'>>): Promise<void> {
	const proiecte = await getProiecte();
	const idx = proiecte.findIndex((p) => p.id === id);
	if (idx === -1) throw new Error(`Proiect inexistent: ${id}`);
	proiecte[idx] = { ...proiecte[idx], ...câmpuri };
	await writeJson(PROIECTE_PATH, proiecte);
	await regenereazăPortofoliuJson();
}

export async function actualizeazăPoza(id: string, câmpuri: Partial<Pick<Poza, 'nota' | 'ascunsa'>>): Promise<void> {
	const photoSrc = await getPhotoSrc();
	const idx = photoSrc.photos.findIndex((p) => p.id === id);
	if (idx === -1) throw new Error(`Poză inexistentă: ${id}`);
	photoSrc.photos[idx] = { ...photoSrc.photos[idx], ...câmpuri };
	await writeJson(PHOTO_SRC_PATH, photoSrc);
	await regenereazăPortofoliuJson();
}

export async function ștergePoza(id: string): Promise<void> {
	const photoSrc = await getPhotoSrc();
	photoSrc.photos = photoSrc.photos.filter((p) => p.id !== id);
	await writeJson(PHOTO_SRC_PATH, photoSrc);
	for (const suffix of ['_s.webp', '_l.webp']) {
		try {
			await unlink(path.join(THUMBS_DIR, `${id}${suffix}`));
		} catch {
			// fișierul poate lipsi deja
		}
	}
	await regenereazăPortofoliuJson();
}

export async function ștergeProiect(id: string): Promise<{ pozeȘterse: number }> {
	const proiecte = await getProiecte();
	const rămase = proiecte.filter((p) => p.id !== id);
	if (rămase.length === proiecte.length) throw new Error(`Proiect inexistent: ${id}`);
	await writeJson(PROIECTE_PATH, rămase);

	const photoSrc = await getPhotoSrc();
	const dePăstrat = photoSrc.photos.filter((p) => p.project_id !== id);
	const deȘters = photoSrc.photos.filter((p) => p.project_id === id);
	photoSrc.photos = dePăstrat;
	delete photoSrc.projects_source[id];
	await writeJson(PHOTO_SRC_PATH, photoSrc);

	for (const p of deȘters) {
		for (const suffix of ['_s.webp', '_l.webp']) {
			try {
				await unlink(path.join(THUMBS_DIR, `${p.id}${suffix}`));
			} catch {
				// fișierul poate lipsi deja
			}
		}
	}

	await regenereazăPortofoliuJson();
	return { pozeȘterse: deȘters.length };
}
