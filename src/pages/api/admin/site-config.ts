import type { APIRoute } from 'astro';
import { getSiteConfig, saveSiteConfig } from '../../../lib/siteConfig';

export const prerender = false;

export const GET: APIRoute = async () => {
	const config = await getSiteConfig();
	return new Response(JSON.stringify(config), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	if (!body?.header || !body?.footer) {
		return new Response(JSON.stringify({ error: 'Structură invalidă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	await saveSiteConfig(body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
