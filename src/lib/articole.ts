import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import path from 'node:path';

const ARTICOLE_DIR = path.join(process.cwd(), 'src', 'content', 'articole');

export interface ArticolMeta {
	slug: string;
	title: string;
	categorie: string;
	data: string;
	dataAdaugare: string;
	sursaNume?: string;
	sursaUrl?: string;
	imagine?: string;
	etichete?: string[];
}

export interface Articol extends ArticolMeta {
	continut: string;
}

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(DIACRITICS_RE, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 90);
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; continut: string } {
	const normalized = raw.replace(/\r\n/g, '\n');
	const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { meta: {}, continut: normalized };
	const [, fm, continut] = match;
	const meta: Record<string, string> = {};
	for (const line of fm.split('\n')) {
		const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
		if (!m) continue;
		let value = m[2].trim();
		if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
		meta[m[1]] = value;
	}
	return { meta, continut: continut.trim() };
}

function toFrontmatterValue(value: string): string {
	return `"${value.replace(/"/g, '\\"')}"`;
}

function parseEticheteValue(raw: string | undefined): string[] {
	if (!raw) return [];
	const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
	return inner
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function buildFileContent(meta: ArticolMeta, continut: string): string {
	const lines = [
		`title: ${toFrontmatterValue(meta.title)}`,
		`categorie: ${meta.categorie}`,
		`data: ${meta.data}`,
		`dataAdaugare: ${toFrontmatterValue(meta.dataAdaugare)}`,
	];
	if (meta.sursaNume) lines.push(`sursaNume: ${toFrontmatterValue(meta.sursaNume)}`);
	if (meta.sursaUrl) lines.push(`sursaUrl: ${toFrontmatterValue(meta.sursaUrl)}`);
	if (meta.imagine) lines.push(`imagine: ${toFrontmatterValue(meta.imagine)}`);
	if (meta.etichete && meta.etichete.length > 0) lines.push(`etichete: [${meta.etichete.join(', ')}]`);
	return `---\n${lines.join('\n')}\n---\n\n${continut.trim()}\n`;
}

async function dataAdaugareImplicită(filePath: string): Promise<string> {
	try {
		const stats = await stat(filePath);
		return (stats.birthtime.getTime() > 0 ? stats.birthtime : stats.mtime).toISOString().slice(0, 10);
	} catch {
		return new Date().toISOString().slice(0, 10);
	}
}

export async function listArticole(): Promise<ArticolMeta[]> {
	const files = await readdir(ARTICOLE_DIR);
	const results: ArticolMeta[] = [];
	for (const file of files) {
		if (!file.endsWith('.md')) continue;
		const filePath = path.join(ARTICOLE_DIR, file);
		const raw = await readFile(filePath, 'utf-8');
		const { meta } = parseFrontmatter(raw);
		results.push({
			slug: file.replace(/\.md$/, ''),
			title: meta.title ?? file,
			categorie: meta.categorie ?? '',
			data: meta.data ?? '',
			dataAdaugare: meta.dataAdaugare || (await dataAdaugareImplicită(filePath)),
			sursaNume: meta.sursaNume,
			sursaUrl: meta.sursaUrl,
			imagine: meta.imagine,
			etichete: parseEticheteValue(meta.etichete),
		});
	}
	return results.sort((a, b) => (a.data < b.data ? 1 : -1));
}

export async function getArticol(slug: string): Promise<Articol | null> {
	const filePath = path.join(ARTICOLE_DIR, `${slug}.md`);
	try {
		const raw = await readFile(filePath, 'utf-8');
		const { meta, continut } = parseFrontmatter(raw);
		return {
			slug,
			title: meta.title ?? '',
			categorie: meta.categorie ?? '',
			data: meta.data ?? '',
			dataAdaugare: meta.dataAdaugare || (await dataAdaugareImplicită(filePath)),
			sursaNume: meta.sursaNume,
			sursaUrl: meta.sursaUrl,
			imagine: meta.imagine,
			etichete: parseEticheteValue(meta.etichete),
			continut,
		};
	} catch {
		return null;
	}
}

export async function saveArticol(input: {
	slug?: string;
	title: string;
	categorie: string;
	data: string;
	sursaNume?: string;
	sursaUrl?: string;
	imagine?: string;
	etichete?: string[];
	continut: string;
}): Promise<string> {
	const slug = input.slug || slugify(input.title);
	const filePath = path.join(ARTICOLE_DIR, `${slug}.md`);

	const existent = await getArticol(slug);
	const dataAdaugare = existent?.dataAdaugare || new Date().toISOString().slice(0, 10);

	const content = buildFileContent(
		{
			slug,
			title: input.title,
			categorie: input.categorie,
			data: input.data,
			dataAdaugare,
			sursaNume: input.sursaNume,
			sursaUrl: input.sursaUrl,
			imagine: input.imagine,
			etichete: input.etichete,
		},
		input.continut
	);
	await writeFile(filePath, content, 'utf-8');
	return slug;
}

export async function deleteArticol(slug: string): Promise<void> {
	const filePath = path.join(ARTICOLE_DIR, `${slug}.md`);
	await unlink(filePath);
}
