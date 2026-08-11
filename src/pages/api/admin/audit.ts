import type { APIRoute } from 'astro';
import { ruleazaAudit } from '../../../lib/audit';

export const prerender = false;

const CATEGORII_VALIDE = new Set(['build', 'securitate', 'legal', 'seo-git']);

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const categorii = Array.isArray(body.categorii) ? body.categorii.filter((c: unknown) => typeof c === 'string' && CATEGORII_VALIDE.has(c)) : [];

	if (categorii.length === 0) {
		return new Response(JSON.stringify({ error: 'Selectează cel puțin o categorie de verificat.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const rezultate = await ruleazaAudit(categorii);
	return new Response(JSON.stringify({ rezultate }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
