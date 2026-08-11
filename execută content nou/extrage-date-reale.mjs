import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'C:\\Users\\730\\Desktop\\sep';
const ARTICOLE_DIR = path.join(ROOT, 'src', 'content', 'articole');

const APPLY = process.argv.includes('--apply');

function parseFrontmatter(raw) {
	const normalized = raw.replace(/\r\n/g, '\n');
	const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return null;
	const [, fm, continut] = match;
	return { fm, continut, raw: normalized };
}

function getField(fm, name) {
	const m = fm.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
	if (!m) return undefined;
	let v = m[1].trim();
	if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
	return v;
}

// Try to extract a date directly from the URL path, e.g. /2026/08/03/
function dateFromUrl(url) {
	const m = url.match(/\/(20\d{2})\/(\d{1,2})\/(\d{1,2})\//);
	if (m) {
		const [, y, mo, d] = m;
		const mm = mo.padStart(2, '0');
		const dd = d.padStart(2, '0');
		if (Number(mo) >= 1 && Number(mo) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
			return `${y}-${mm}-${dd}`;
		}
	}
	return null;
}

const META_PATTERNS = [
	/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
	/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i,
	/<meta[^>]+name=["']publish-date["'][^>]+content=["']([^"']+)["']/i,
	/<meta[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i,
	/<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
	/"datePublished"\s*:\s*"([^"]+)"/i,
	/<time[^>]+datetime=["']([^"']+)["']/i,
];

function extractDateFromHtml(html) {
	for (const re of META_PATTERNS) {
		const m = html.match(re);
		if (m) {
			const d = new Date(m[1]);
			if (!isNaN(d.getTime())) {
				return d.toISOString().slice(0, 10);
			}
		}
	}
	return null;
}

async function fetchPublishDate(url) {
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
			signal: AbortSignal.timeout(15000),
		});
		if (!res.ok) return { error: `HTTP ${res.status}` };
		const html = await res.text();
		const date = extractDateFromHtml(html);
		return date ? { date } : { error: 'no-date-found' };
	} catch (e) {
		return { error: String(e.message || e) };
	}
}

async function main() {
	const files = (await readdir(ARTICOLE_DIR)).filter((f) => f.endsWith('.md'));
	const rezultate = [];

	for (const file of files) {
		const slug = file.replace(/\.md$/, '');
		const full = path.join(ARTICOLE_DIR, file);
		const raw = await readFile(full, 'utf-8');
		const parsed = parseFrontmatter(raw);
		if (!parsed) continue;
		const sursaUrl = getField(parsed.fm, 'sursaUrl');
		const dataActuala = getField(parsed.fm, 'data');

		if (!sursaUrl) {
			rezultate.push({ slug, dataActuala, sursaUrl: null, status: 'fara-sursa' });
			continue;
		}

		let pathname = '';
		try {
			pathname = new URL(sursaUrl).pathname;
		} catch {}
		const esteDomeniuBar = pathname === '' || pathname === '/';

		let dataReala = dateFromUrl(sursaUrl);
		let metoda = dataReala ? 'url' : null;

		if (esteDomeniuBar && !dataReala) {
			rezultate.push({ slug, dataActuala, sursaUrl, status: 'sursa-generica' });
			continue;
		}

		if (!dataReala) {
			const r = await fetchPublishDate(sursaUrl);
			if (r.date) {
				dataReala = r.date;
				metoda = 'html';
			} else {
				rezultate.push({ slug, dataActuala, sursaUrl, status: 'nu-s-a-gasit', eroare: r.error });
				continue;
			}
		}

		rezultate.push({
			slug,
			dataActuala,
			dataReala,
			metoda,
			sursaUrl,
			status: dataReala === dataActuala ? 'identica' : 'diferita',
		});

		if (APPLY && dataReala !== dataActuala) {
			const newFm = parsed.fm.replace(/^data:\s*.*$/m, `data: ${dataReala}`);
			const newRaw = `---\n${newFm}\n---\n\n${parsed.continut}\n`;
			await writeFile(full, newRaw, 'utf-8');
		}
	}

	await writeFile(
		path.join(ROOT, 'execută content nou', 'raport-date-reale.json'),
		JSON.stringify(rezultate, null, 2),
		'utf-8'
	);

	const diferite = rezultate.filter((r) => r.status === 'diferita');
	const identice = rezultate.filter((r) => r.status === 'identica');
	const negasite = rezultate.filter((r) => r.status === 'nu-s-a-gasit');
	const faraSursa = rezultate.filter((r) => r.status === 'fara-sursa');

	console.log(`Total articole: ${rezultate.length}`);
	console.log(`Date diferite (${APPLY ? 'APLICATE' : 'de aplicat'}): ${diferite.length}`);
	console.log(`Date deja corecte: ${identice.length}`);
	console.log(`Nu s-a putut determina data: ${negasite.length}`);
	console.log(`Fara sursaUrl: ${faraSursa.length}`);
	console.log(`Raport complet salvat in: execută content nou\\raport-date-reale.json`);
}

main();
