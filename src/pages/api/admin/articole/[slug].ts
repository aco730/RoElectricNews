import type { APIRoute } from 'astro';
import { getArticol, deleteArticol, saveArticol } from '../../../../lib/articole';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const articol = await getArticol(params.slug!);
	if (!articol) {
		return new Response(JSON.stringify({ error: 'Nu a fost găsit.' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	return new Response(JSON.stringify(articol), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PATCH: APIRoute = async ({ params, request }) => {
	const articol = await getArticol(params.slug!);
	if (!articol) {
		return new Response(JSON.stringify({ error: 'Nu a fost găsit.' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	const { categorie } = await request.json();
	if (!categorie) {
		return new Response(JSON.stringify({ error: 'Categorie lipsă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	await saveArticol({ ...articol, slug: params.slug!, categorie });
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const DELETE: APIRoute = async ({ params }) => {
	await deleteArticol(params.slug!);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
