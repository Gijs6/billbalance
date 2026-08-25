import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { setFlash } from '$lib/server/flash';
import { isLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	return { user: locals.user };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		if (!locals.user) redirect(302, '/login');

		const form = await request.formData();
		const locale = form.get('locale');

		if (!isLocale(locale)) {
			return fail(400, {});
		}

		await auth.api.updateUser({ body: { locale }, headers: request.headers });

		setFlash(cookies, m.settings_flashUpdated({}, { locale }));
		redirect(303, '/settings');
	}
};
