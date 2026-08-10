import type { APIRoute } from 'astro';
import { getContact, saveContact } from '../../../lib/contact';

export const prerender = false;

export const GET: APIRoute = async () => {
	const contact = await getContact();
	return new Response(JSON.stringify(contact), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	if (typeof body.telefon !== 'string' || typeof body.adresa !== 'string') {
		return new Response(JSON.stringify({ error: 'Structură invalidă.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	await saveContact(body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
