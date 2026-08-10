import type { APIRoute } from 'astro';
import { getEtichete, saveEtichete } from '../../../lib/etichete';

export const prerender = false;

export const GET: APIRoute = async () => {
	const etichete = await getEtichete();
	return new Response(JSON.stringify(etichete), {
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
		if (!item.text) {
			return new Response(JSON.stringify({ error: 'Fiecare etichetă are nevoie de text.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
	const rezultat = await saveEtichete(body);
	return new Response(JSON.stringify(rezultat), {
		headers: { 'Content-Type': 'application/json' },
	});
};
