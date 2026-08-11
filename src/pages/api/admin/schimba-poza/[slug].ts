import type { APIRoute } from 'astro';
import { getArticol, saveArticol } from '../../../../lib/articole';
import { extrageCuvinteCheie, cautăImagineAlternativăPexels, descarcăȘiSalvează } from '../../../../lib/pexels';

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: 'Slug lipsă' }), { status: 400 });
	}

	const apiKey = import.meta.env.PEXELS_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'Lipsește PEXELS_API_KEY din .env' }), { status: 400 });
	}

	const articol = await getArticol(slug);
	if (!articol) {
		return new Response(JSON.stringify({ error: 'Articol negăsit' }), { status: 404 });
	}

	try {
		const cuvinteCheie = extrageCuvinteCheie(articol.title);
		const imgUrl = await cautăImagineAlternativăPexels(cuvinteCheie, apiKey);
		if (!imgUrl) {
			return new Response(JSON.stringify({ error: 'Nicio imagine găsită pe Pexels pentru acest titlu' }), { status: 404 });
		}
		const caleLocală = await descarcăȘiSalvează(imgUrl, slug);
		await saveArticol({ ...articol, imagine: caleLocală });
		return new Response(JSON.stringify({ imagine: caleLocală }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
	}
};
