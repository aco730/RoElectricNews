import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'C:\\Users\\730\\Desktop\\sep';
const ARTICOLE_DIR = path.join(ROOT, 'src', 'content', 'articole');

const STOPWORDS = new Set([
	'de', 'la', 'in', 'si', 'ce', 'pe', 'cu', 'un', 'o', 'ai', 'a', 'e', 'ca', 'sau',
	'nu', 'mai', 'din', 'pentru', 'care', 'cum', 'ghid', 'vs', 'este', 'sunt', 'noi', 'nou',
	'te', 'costa', 'costurile', 'costuri', 'cat', '2026', '2025', '2027',
]);

function normalizeazaTokeni(titlu) {
	return new Set(
		titlu
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 2 && !STOPWORDS.has(w))
	);
}

function jaccard(a, b) {
	const inter = [...a].filter((x) => b.has(x)).length;
	const union = new Set([...a, ...b]).size;
	return union === 0 ? 0 : inter / union;
}

export async function incarcaArticoleExistente() {
	const files = await readdir(ARTICOLE_DIR);
	const rezultate = [];
	for (const file of files) {
		if (!file.endsWith('.md')) continue;
		const raw = await readFile(path.join(ARTICOLE_DIR, file), 'utf-8');
		const titleM = raw.match(/title:\s*"(.*?)"/);
		const srcM = raw.match(/sursaUrl:\s*"(.*?)"/);
		rezultate.push({
			slug: file.replace(/\.md$/, ''),
			title: titleM ? titleM[1] : '',
			sursaUrl: srcM ? srcM[1] : '',
			tokeni: normalizeazaTokeni(titleM ? titleM[1] : ''),
		});
	}
	return rezultate;
}

export function verificaCandidati(candidati, existente, prag = 0.15) {
	const urlCount = new Map();
	for (const e of existente) {
		if (!e.sursaUrl) continue;
		urlCount.set(e.sursaUrl, (urlCount.get(e.sursaUrl) || 0) + 1);
	}

	return candidati.map((c) => {
		const tokeniC = normalizeazaTokeni(c.title);
		const potriviri = existente
			.map((e) => ({ ...e, scor: jaccard(tokeniC, e.tokeni) }))
			.filter((e) => e.scor >= prag)
			.sort((a, b) => b.scor - a.scor);

		const urlDejaFolosit = c.sursaUrl ? (urlCount.get(c.sursaUrl) || 0) : 0;

		return {
			title: c.title,
			potriviri: potriviri.slice(0, 3),
			urlDejaFolositDeOri: urlDejaFolosit,
		};
	});
}

import { pathToFileURL } from 'node:url';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const candidatiPath = process.argv[2];
	if (!candidatiPath) {
		console.error('Utilizare: node verifica-duplicate.mjs <cale-json-candidati>');
		process.exit(1);
	}
	const candidati = JSON.parse(await readFile(candidatiPath, 'utf-8'));
	const existente = await incarcaArticoleExistente();
	const rezultate = verificaCandidati(candidati, existente);

	let riscuri = 0;
	for (const r of rezultate) {
		const areRisc = r.potriviri.length > 0 || r.urlDejaFolositDeOri >= 2;
		if (areRisc) riscuri++;
		console.log(`\n${areRisc ? '⚠️ ' : '✅ '}${r.title}`);
		if (r.urlDejaFolositDeOri >= 2) {
			console.log(`   URL sursă deja folosit de ${r.urlDejaFolositDeOri} ori pentru alte articole`);
		}
		for (const p of r.potriviri) {
			console.log(`   posibil duplicat (${(p.scor * 100).toFixed(0)}%): ${p.slug} — "${p.title}"`);
		}
	}
	console.log(`\nTotal candidați: ${rezultate.length} | cu risc semnalat: ${riscuri}`);
}
