import type { APIRoute } from 'astro';
import { getQaArticol, saveQaArticol } from '../../../../lib/qa';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const items = await getQaArticol(params.slug!);
	return new Response(JSON.stringify(items), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ params, request }) => {
	const body = await request.json();
	if (!Array.isArray(body)) {
		return new Response(JSON.stringify({ error: 'Listă invalidă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	for (const item of body) {
		if (!item.intrebare || !item.raspuns) {
			return new Response(JSON.stringify({ error: 'Fiecare item are nevoie de întrebare și răspuns.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
	await saveQaArticol(params.slug!, body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
