import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const result = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = result?.user ?? null;
	event.locals.session = result?.session ?? null;
	return resolve(event);
};
