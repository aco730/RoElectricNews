import type { APIRoute } from 'astro';
import { listArticole } from '../../../lib/articole';
import { sugereazaPentruToate } from '../../../lib/categorie-sugestii';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const articole = await listArticole();
	const prag = Number(url.searchParams.get('prag') ?? '0.15');
	const rezultate = sugereazaPentruToate(articole, prag);
	return new Response(JSON.stringify({ rezultate }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
