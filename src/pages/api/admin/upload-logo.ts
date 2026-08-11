import type { APIRoute } from 'astro';
import { saveLogoFile, genereazaFaviconDinBuffer } from '../../../lib/siteConfig';

export const prerender = false;

const TIPURI_PERMISE = new Set(['image/png', 'image/webp', 'image/jpeg']);
const MAX_BYTES = 3 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const file = form.get('logo');

	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: 'Niciun fișier trimis.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (!TIPURI_PERMISE.has(file.type)) {
		return new Response(JSON.stringify({ error: 'Format neacceptat. Folosește PNG, WEBP sau JPEG.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: 'Fișier prea mare (max 3MB).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const publicPath = await saveLogoFile(file.type, buffer);

	const foloseșteCaFavicon = String(form.get('faviconAuto') ?? '') === 'true';
	let faviconActualizat = false;
	if (foloseșteCaFavicon) {
		try {
			await genereazaFaviconDinBuffer(buffer);
			faviconActualizat = true;
		} catch {
			// nu blocăm salvarea logo-ului dacă generarea favicon-ului eșuează
		}
	}

	return new Response(JSON.stringify({ path: publicPath, faviconActualizat }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
