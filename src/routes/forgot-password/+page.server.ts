import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = form.get('email');

		if (typeof email !== 'string' || !email) {
			return fail(400, { message: m.auth_forgotErrorEnterEmail() });
		}

		await auth.api.requestPasswordReset({
			body: { email: email.toLowerCase().trim() },
			headers: event.request.headers
		});

		return { sent: true };
	}
};
