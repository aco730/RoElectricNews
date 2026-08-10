import type { APIRoute } from 'astro';
import { getMateriale, saveMateriale } from '../../../lib/materialeOferta';

export const prerender = false;

export const GET: APIRoute = async () => {
	const materiale = await getMateriale();
	return new Response(JSON.stringify(materiale), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	if (!Array.isArray(body)) {
		return new Response(JSON.stringify({ error: 'Listă invalidă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	for (const item of body) {
		if (!item.categorie || !item.produs) {
			return new Response(JSON.stringify({ error: 'Fiecare material are nevoie de categorie și nume produs.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
	try {
		await saveMateriale(body);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
