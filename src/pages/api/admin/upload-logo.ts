import type { APIRoute } from 'astro';
import { saveLogoFile } from '../../../lib/siteConfig';

export const prerender = false;

const TIPURI_PERMISE = new Set(['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg']);
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
		return new Response(JSON.stringify({ error: 'Format neacceptat. Folosește PNG, SVG, WEBP sau JPEG.' }), {
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
	const publicPath = await saveLogoFile(file.name, buffer);

	return new Response(JSON.stringify({ path: publicPath }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
