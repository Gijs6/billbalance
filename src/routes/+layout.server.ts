import type { LayoutServerLoad } from './$types';
import { readFlash } from '$lib/server/flash';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	return { user: locals.user, flash: readFlash(cookies) };
};
