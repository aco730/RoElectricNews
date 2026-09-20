import type { APIRoute } from 'astro';
import { currentVariant, recordClick, type CtaButton } from '../../lib/clickTracking';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const button: CtaButton = body?.button === 'phone' ? 'phone' : 'whatsapp';
		await recordClick(currentVariant(), button);
	} catch {
		// Tracking-ul nu trebuie sa strice niciodata click-ul real al vizitatorului.
	}
	return new Response(null, { status: 204 });
};
