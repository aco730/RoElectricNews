import type { APIRoute } from 'astro';
import { listArticole, saveArticol } from '../../../../lib/articole';

export const prerender = false;

export const GET: APIRoute = async () => {
	const articole = await listArticole();
	return new Response(JSON.stringify(articole), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();
	const { title, categorie, data, sursaNume, sursaUrl, imagine, etichete, continut, slug } = body;

	if (!title || !categorie || !data || !continut) {
		return new Response(JSON.stringify({ error: 'Câmpuri obligatorii lipsă (titlu, categorie, dată, conținut).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const savedSlug = await saveArticol({ slug, title, categorie, data, sursaNume, sursaUrl, imagine, etichete, continut });
	return new Response(JSON.stringify({ slug: savedSlug }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
