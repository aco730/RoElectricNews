import type { APIRoute } from 'astro';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const prerender = false;

const TIPURI_PERMISE = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 8 * 1024 * 1024;
const DEST_DIR = path.join(process.cwd(), 'public', 'images', 'articole');

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

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const file = form.get('imagine');
	const slugSauTitlu = String(form.get('slug') ?? '').trim();

	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: 'Niciun fișier trimis.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (!TIPURI_PERMISE.has(file.type)) {
		return new Response(JSON.stringify({ error: 'Format neacceptat. Folosește PNG, JPG sau WEBP.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: 'Fișier prea mare (max 8MB).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const ext = path.extname(file.name).toLowerCase() || '.jpg';
	const bazaNume = slugify(slugSauTitlu) || crypto.randomBytes(4).toString('hex');
	const numeFisier = `${bazaNume}${ext}`;

	await mkdir(DEST_DIR, { recursive: true });
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(DEST_DIR, numeFisier), buffer);

	return new Response(JSON.stringify({ path: `/images/articole/${numeFisier}` }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
