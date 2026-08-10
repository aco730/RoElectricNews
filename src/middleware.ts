import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, isValidSessionCookie } from './lib/adminAuth';

const peNetlify = Boolean(import.meta.env.NETLIFY);

export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;

	if (peNetlify && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))) {
		return new Response('Not found', { status: 404 });
	}

	if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
		const cookie = context.cookies.get(COOKIE_NAME)?.value;
		if (!isValidSessionCookie(cookie)) {
			return context.redirect('/admin/login');
		}
	}

	if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
		const cookie = context.cookies.get(COOKIE_NAME)?.value;
		if (!isValidSessionCookie(cookie)) {
			return new Response(JSON.stringify({ error: 'Neautorizat' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	return next();
});
