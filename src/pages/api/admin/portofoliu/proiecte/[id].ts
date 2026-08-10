import type { APIRoute } from 'astro';
import { getProiecte, getPhotoSrc, actualizeazăProiect, ștergeProiect } from '../../../../../lib/portofoliu';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const proiecte = await getProiecte();
	const proiect = proiecte.find((p) => p.id === params.id);
	if (!proiect) {
		return new Response(JSON.stringify({ error: 'Proiect inexistent.' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	const photoSrc = await getPhotoSrc();
	const poze = photoSrc.photos.filter((p) => p.project_id === params.id);
	return new Response(JSON.stringify({ ...proiect, poze }), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ params, request }) => {
	const body = await request.json();
	try {
		await actualizeazăProiect(params.id!, body);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const DELETE: APIRoute = async ({ params }) => {
	try {
		const rezultat = await ștergeProiect(params.id!);
		return new Response(JSON.stringify({ ok: true, ...rezultat }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
