import type { APIRoute } from 'astro';
import { getCategorii, saveCategorii, numărArticolePerCategorie } from '../../../lib/categorii';

export const prerender = false;

export const GET: APIRoute = async () => {
	const categorii = await getCategorii();
	const counts = await numărArticolePerCategorie();
	const rezultat = categorii.map((c) => ({ ...c, nrArticole: counts[c.slug] ?? 0 }));
	return new Response(JSON.stringify(rezultat), {
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
		if (!item.name) {
			return new Response(JSON.stringify({ error: 'Fiecare categorie are nevoie de nume.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	const counts = await numărArticolePerCategorie();
	const sluguriNoi = new Set(body.map((b: any) => b.slug || ''));
	const existente = await getCategorii();
	const șterse = existente.filter((e) => !sluguriNoi.has(e.slug) && counts[e.slug] > 0);
	if (șterse.length > 0) {
		return new Response(
			JSON.stringify({
				error: `Nu poți șterge categoria "${șterse[0].name}" — are ${counts[șterse[0].slug]} articole. Mută articolele în altă categorie mai întâi.`,
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const rezultat = await saveCategorii(body);
	return new Response(JSON.stringify(rezultat), {
		headers: { 'Content-Type': 'application/json' },
	});
};
