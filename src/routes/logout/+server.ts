import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';
import { DEV_SIGNED_OUT_COOKIE } from '$lib/server/dev-user';

export const POST: RequestHandler = async (event) => {
	if (event.locals.session) {
		await auth.api.signOut({ headers: event.request.headers });
	}
	if (dev) event.cookies.set(DEV_SIGNED_OUT_COOKIE, '1', { path: '/', secure: false });
	redirect(302, '/login');
};
