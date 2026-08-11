import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'C:\\Users\\730\\Desktop\\sep';
const ARTICOLE_DIR = path.join(ROOT, 'src', 'content', 'articole');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'articole');
const QA_PATH = path.join(ROOT, 'src', 'data', 'qa-articole.json');
const PEXELS_KEY = 'ckYShhuH4KyGt8F06VLceLGyIw1kwkzEHyaCMnZKexqgYCeTWSmFJVyp';
const AZI = '2026-08-11';

function slugify(text) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 90);
}

function toFrontmatterValue(value) {
	return `"${value.replace(/"/g, '\\"')}"`;
}

function buildFileContent(meta, continut) {
	const lines = [
		`title: ${toFrontmatterValue(meta.title)}`,
		`categorie: ${meta.categorie}`,
		`data: ${meta.data}`,
		`dataAdaugare: ${toFrontmatterValue(meta.dataAdaugare)}`,
	];
	if (meta.sursaNume) lines.push(`sursaNume: ${toFrontmatterValue(meta.sursaNume)}`);
	if (meta.sursaUrl) lines.push(`sursaUrl: ${toFrontmatterValue(meta.sursaUrl)}`);
	if (meta.imagine) lines.push(`imagine: ${toFrontmatterValue(meta.imagine)}`);
	return `---\n${lines.join('\n')}\n---\n\n${continut.trim()}\n`;
}

const STOPWORDS = new Set([
	'de', 'la', 'in', 'si', 'ce', 'pe', 'cu', 'un', 'o', 'ai', 'a', 'e', 'ca', 'sau',
	'nu', 'mai', 'din', 'pentru', 'care', 'cum', 'ghid', 'vs', 'este', 'sunt', 'noi', 'nou',
	'cat', 'costa', 'costurile', 'costuri', 'reale', 'per', 'cost',
]);

function extrageCuvinteCheie(titlu) {
	const cuvinte = titlu
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 2 && !STOPWORDS.has(w));
	return cuvinte.slice(0, 3).join(' ');
}

async function cautaImaginePexels(interogare) {
	const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(interogare)}&per_page=1&orientation=landscape`;
	const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
	if (!res.ok) throw new Error(`Pexels ${res.status}`);
	const data = await res.json();
	const foto = data.photos?.[0];
	if (!foto) return null;
	return foto.src?.large ?? foto.src?.medium ?? null;
}

async function descarcaSiSalveaza(imgUrl, slug) {
	const res = await fetch(imgUrl);
	if (!res.ok) throw new Error(`Descarcare esuata ${res.status}`);
	const buffer = Buffer.from(await res.arrayBuffer());
	await mkdir(IMG_DIR, { recursive: true });
	const fileName = `${slug}.jpg`;
	await writeFile(path.join(IMG_DIR, fileName), buffer);
	return `/images/articole/${fileName}`;
}

const DATA_FILE = process.argv[2] || path.join(ROOT, 'execută content nou', 'articole-data.json');
const ARTICOLE = JSON.parse(await readFile(DATA_FILE, 'utf-8'));

async function main() {
	const qaAll = JSON.parse(await readFile(QA_PATH, 'utf-8'));
	const rezultate = [];

	for (const art of ARTICOLE) {
		const slug = slugify(art.title);
		try {
			const kw = extrageCuvinteCheie(art.title);
			let imagine;
			try {
				const imgUrl = await cautaImaginePexels(kw);
				if (imgUrl) imagine = await descarcaSiSalveaza(imgUrl, slug);
			} catch (e) {
				console.log(`  (fara imagine pentru ${slug}: ${e.message})`);
			}

			const content = buildFileContent(
				{
					title: art.title,
					categorie: art.categorie,
					data: AZI,
					dataAdaugare: AZI,
					sursaNume: art.sursaNume,
					sursaUrl: art.sursaUrl,
					imagine,
				},
				art.continut
			);
			await writeFile(path.join(ARTICOLE_DIR, `${slug}.md`), content, 'utf-8');

			qaAll[slug] = art.faq;

			rezultate.push({ slug, imagine: !!imagine, ok: true });
			console.log(`OK: ${slug}${imagine ? ' (+imagine)' : ' (FARA imagine)'}`);
			await new Promise((r) => setTimeout(r, 300));
		} catch (e) {
			rezultate.push({ slug, ok: false, eroare: e.message });
			console.log(`EROARE: ${slug} - ${e.message}`);
		}
	}

	await writeFile(QA_PATH, JSON.stringify(qaAll, null, 2) + '\n', 'utf-8');
	console.log('\nTotal:', rezultate.length, '| OK:', rezultate.filter(r => r.ok).length);
}

main();
