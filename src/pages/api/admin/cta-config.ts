import type { APIRoute } from 'astro';
import { getCtaConfig, saveCtaConfig } from '../../../lib/ctaConfig';

export const prerender = false;

export const GET: APIRoute = async () => {
	const config = await getCtaConfig();
	return new Response(JSON.stringify(config), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	if (!body?.blog || !body?.portofoliu || !body?.servicii) {
		return new Response(JSON.stringify({ error: 'Structură invalidă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	await saveCtaConfig(body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
