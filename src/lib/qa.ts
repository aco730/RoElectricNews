import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const QA_ARTICOLE_PATH = path.join(process.cwd(), 'src', 'data', 'qa-articole.json');
const QA_CATEGORII_PATH = path.join(process.cwd(), 'src', 'data', 'qa-categorii.json');

export interface QaArticol {
	intrebare: string;
	raspuns: string;
}

export interface QaCategorie {
	intrebare: string;
	raspuns: string;
	articole: string[];
}

async function readJson<T>(filePath: string): Promise<T> {
	const raw = await readFile(filePath, 'utf-8');
	return JSON.parse(raw) as T;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
	await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// --- Q&A per articol ---

export async function getAllQaArticole(): Promise<Record<string, QaArticol[]>> {
	return readJson<Record<string, QaArticol[]>>(QA_ARTICOLE_PATH);
}

export async function getQaArticol(slug: string): Promise<QaArticol[]> {
	const all = await getAllQaArticole();
	return all[slug] ?? [];
}

export async function saveQaArticol(slug: string, items: QaArticol[]): Promise<void> {
	const all = await readJson<Record<string, QaArticol[]>>(QA_ARTICOLE_PATH);
	if (items.length === 0) {
		delete all[slug];
	} else {
		all[slug] = items;
	}
	await writeJson(QA_ARTICOLE_PATH, all);
}

// --- Q&A per categorie (FAQ) ---

export async function getQaCategorii(): Promise<Record<string, QaCategorie[]>> {
	return readJson<Record<string, QaCategorie[]>>(QA_CATEGORII_PATH);
}

export async function getQaCategorie(slug: string): Promise<QaCategorie[]> {
	const all = await getQaCategorii();
	return all[slug] ?? [];
}

export async function saveQaCategorie(slug: string, items: QaCategorie[]): Promise<void> {
	const all = await readJson<Record<string, QaCategorie[]>>(QA_CATEGORII_PATH);
	if (items.length === 0) {
		delete all[slug];
	} else {
		all[slug] = items;
	}
	await writeJson(QA_CATEGORII_PATH, all);
}
