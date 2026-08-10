import type { APIRoute } from 'astro';
import { getArticol, deleteArticol } from '../../../../lib/articole';

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

export const DELETE: APIRoute = async ({ params }) => {
	await deleteArticol(params.slug!);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
