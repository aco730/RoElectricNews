import type { APIRoute } from 'astro';
import { checkPassword, createSessionCookieValue, COOKIE_NAME, esteBlocat, înregistreazăEșecLogin, resetEșecuriLogin } from '../../../lib/adminAuth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
	const ip = clientAddress || 'necunoscut';

	const blocare = esteBlocat(ip);
	if (blocare.blocat) {
		return redirect(`/admin/login?blocat=${blocare.secundeRămase}`);
	}

	const form = await request.formData();
	const password = String(form.get('password') ?? '');

	if (!checkPassword(password)) {
		înregistreazăEșecLogin(ip);
		return redirect('/admin/login?eroare=1');
	}

	resetEșecuriLogin(ip);

	cookies.set(COOKIE_NAME, createSessionCookieValue(), {
		httpOnly: true,
		sameSite: 'strict',
		path: '/',
		maxAge: 12 * 60 * 60,
	});

	return redirect('/admin');
};
