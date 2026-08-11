import type { APIRoute } from 'astro';
import { listArticole, saveArticol, getArticol } from '../../../lib/articole';
import { extrageCuvinteCheie, cautăImaginePexels, descarcăȘiSalvează } from '../../../lib/pexels';

export const prerender = false;

export const POST: APIRoute = async () => {
	const apiKey = import.meta.env.PEXELS_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'Lipsește PEXELS_API_KEY din .env' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const articole = await listArticole();
	const fărăPoză = articole.filter((a) => !a.imagine);

	const rezultate: { slug: string; status: 'ok' | 'fără rezultat' | 'eroare'; detaliu?: string }[] = [];

	for (const meta of fărăPoză) {
		try {
			const cuvinteCheie = extrageCuvinteCheie(meta.title);
			const imgUrl = await cautăImaginePexels(cuvinteCheie, apiKey);
			if (!imgUrl) {
				rezultate.push({ slug: meta.slug, status: 'fără rezultat', detaliu: cuvinteCheie });
				continue;
			}
			const caleLocală = await descarcăȘiSalvează(imgUrl, meta.slug);

			const articolComplet = await getArticol(meta.slug);
			if (!articolComplet) {
				rezultate.push({ slug: meta.slug, status: 'eroare', detaliu: 'articol negăsit la salvare' });
				continue;
			}
			await saveArticol({ ...articolComplet, imagine: caleLocală });
			rezultate.push({ slug: meta.slug, status: 'ok' });

			// pauză scurtă între cereri, ca să nu depășim limita Pexels
			await new Promise((r) => setTimeout(r, 350));
		} catch (e) {
			rezultate.push({ slug: meta.slug, status: 'eroare', detaliu: (e as Error).message });
		}
	}

	return new Response(JSON.stringify({ total: fărăPoză.length, rezultate }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
