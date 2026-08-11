import type { APIRoute } from 'astro';
import { listArticole } from '../../../lib/articole';
import { detecteazaDuplicate } from '../../../lib/duplicate';

export const prerender = false;

export const GET: APIRoute = async () => {
	const articole = await listArticole();
	const perechi = detecteazaDuplicate(articole);
	return new Response(JSON.stringify({ perechi }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
