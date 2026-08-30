import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';

const COOKIE_NAME = 'flash';

export function setFlash(cookies: Cookies, message: string): void {
	cookies.set(COOKIE_NAME, message, { path: '/', maxAge: 10, secure: !dev });
}

export function readFlash(cookies: Cookies): string | null {
	const message = cookies.get(COOKIE_NAME);
	if (message) cookies.delete(COOKIE_NAME, { path: '/' });
	return message ?? null;
}
