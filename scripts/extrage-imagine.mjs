// Extrage imaginea principala (og:image) de pe o pagina sursa si o salveaza local.
// Utilizare: node scripts/extrage-imagine.mjs <url> <slug>
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , url, slug] = process.argv;

if (!url || !slug) {
	console.log(JSON.stringify({ ok: false, error: 'Utilizare: node scripts/extrage-imagine.mjs <url> <slug>' }));
	process.exit(1);
}

const DEST_DIR = path.join(process.cwd(), 'public', 'images', 'articole');

function extrageOgImage(html) {
	const patternuri = [
		/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
		/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
		/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
	];
	for (const re of patternuri) {
		const m = html.match(re);
		if (m) return m[1];
	}
	return null;
}

function extensieDinContentType(ct) {
	if (!ct) return '.jpg';
	if (ct.includes('png')) return '.png';
	if (ct.includes('webp')) return '.webp';
	if (ct.includes('gif')) return '.gif';
	return '.jpg';
}

try {
	const resPagina = await fetch(url, {
		headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEP-ContentBot/1.0)' },
		redirect: 'follow',
	});
	if (!resPagina.ok) {
		console.log(JSON.stringify({ ok: false, error: `Pagina sursă a răspuns cu ${resPagina.status}` }));
		process.exit(0);
	}
	const html = await resPagina.text();
	let imgUrl = extrageOgImage(html);
	if (!imgUrl) {
		console.log(JSON.stringify({ ok: false, error: 'Nu am găsit og:image sau twitter:image pe pagina sursă.' }));
		process.exit(0);
	}
	if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
	else if (imgUrl.startsWith('/')) imgUrl = new URL(imgUrl, url).toString();

	const resImg = await fetch(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEP-ContentBot/1.0)' } });
	if (!resImg.ok) {
		console.log(JSON.stringify({ ok: false, error: `Imaginea a răspuns cu ${resImg.status}`, imgUrl }));
		process.exit(0);
	}
	const buffer = Buffer.from(await resImg.arrayBuffer());
	const ext = extensieDinContentType(resImg.headers.get('content-type'));

	await mkdir(DEST_DIR, { recursive: true });
	const fileName = `${slug}${ext}`;
	await writeFile(path.join(DEST_DIR, fileName), buffer);

	console.log(JSON.stringify({ ok: true, path: `/images/articole/${fileName}`, sursaImagine: imgUrl }));
} catch (err) {
	console.log(JSON.stringify({ ok: false, error: err.message }));
}
