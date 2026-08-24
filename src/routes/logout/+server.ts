import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	if (event.locals.session) {
		await auth.api.signOut({ headers: event.request.headers });
	}
	redirect(302, '/login');
};
