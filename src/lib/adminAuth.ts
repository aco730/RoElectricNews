import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'sep_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

const MAX_ÎNCERCĂRI = 5;
const FEREASTRĂ_MS = 15 * 60 * 1000; // 15 min
const BLOCARE_MS = 15 * 60 * 1000; // 15 min

interface StareÎncercări {
	nrEșecuri: number;
	primaÎncercare: number;
	blocatPână?: number;
}

const încercăriLogin = new Map<string, StareÎncercări>();

export function esteBlocat(ip: string): { blocat: boolean; secundeRămase?: number } {
	const stare = încercăriLogin.get(ip);
	if (!stare?.blocatPână) return { blocat: false };
	if (Date.now() >= stare.blocatPână) {
		încercăriLogin.delete(ip);
		return { blocat: false };
	}
	return { blocat: true, secundeRămase: Math.ceil((stare.blocatPână - Date.now()) / 1000) };
}

export function înregistreazăEșecLogin(ip: string): void {
	const acum = Date.now();
	const stare = încercăriLogin.get(ip);

	if (!stare || acum - stare.primaÎncercare > FEREASTRĂ_MS) {
		încercăriLogin.set(ip, { nrEșecuri: 1, primaÎncercare: acum });
		return;
	}

	stare.nrEșecuri += 1;
	if (stare.nrEșecuri >= MAX_ÎNCERCĂRI) {
		stare.blocatPână = acum + BLOCARE_MS;
	}
}

export function resetEșecuriLogin(ip: string): void {
	încercăriLogin.delete(ip);
}

function getSecret() {
	const secret = import.meta.env.ADMIN_SESSION_SECRET;
	if (!secret) throw new Error('ADMIN_SESSION_SECRET nu este setat în .env');
	return secret;
}

function sign(value: string) {
	return createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionCookieValue() {
	const expires = Date.now() + SESSION_TTL_MS;
	const payload = `${expires}`;
	const sig = sign(payload);
	return `${payload}.${sig}`;
}

export function isValidSessionCookie(value: string | undefined): boolean {
	if (!value) return false;
	const [payload, sig] = value.split('.');
	if (!payload || !sig) return false;
	const expected = sign(payload);
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
	const expires = Number(payload);
	if (!Number.isFinite(expires) || Date.now() > expires) return false;
	return true;
}

export function checkPassword(candidate: string): boolean {
	const real = import.meta.env.ADMIN_PASSWORD;
	if (!real) return false;
	const a = Buffer.from(candidate);
	const b = Buffer.from(real);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export { COOKIE_NAME };
