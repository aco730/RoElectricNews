import type { APIRoute } from 'astro';
import { checkPassword } from '../../lib/adminAuth';
import { readClickCounts } from '../../lib/clickTracking';

export const prerender = false;

// Nu foloseste /api/admin/* fiindca acel prefix e blocat (404) pe Netlify de middleware.
// Acces: /api/click-stats.json?key=PAROLA_ADMIN
export const GET: APIRoute = async ({ url }) => {
	const key = url.searchParams.get('key') || '';
	if (!checkPassword(key)) {
		return new Response(JSON.stringify({ error: 'Neautorizat' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const counts = await readClickCounts();
	return new Response(JSON.stringify(counts, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
};
