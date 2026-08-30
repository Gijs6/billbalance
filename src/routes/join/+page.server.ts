import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { normalizeHumanCode } from '$lib/human-code';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login?redirectTo=/join');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login?redirectTo=/join');

		const form = await request.formData();
		const raw = form.get('code');
		const code = typeof raw === 'string' ? normalizeHumanCode(raw) : '';

		if (!code) {
			return fail(400, {
				message: m.join_errorEnterCode(),
				code: typeof raw === 'string' ? raw : ''
			});
		}

		redirect(303, `/join/${encodeURIComponent(code)}`);
	}
};
