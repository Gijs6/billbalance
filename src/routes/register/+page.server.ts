import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { safeRedirectTarget } from '$lib/server/safe-redirect';
import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(302, safeRedirectTarget(url.searchParams.get('redirectTo')));
	return { redirectTo: url.searchParams.get('redirectTo') ?? '' };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const name = form.get('name');
		const email = form.get('email');
		const password = form.get('password');

		if (typeof name !== 'string' || name.trim().length < 1 || name.length > 100) {
			return fail(400, { message: m.auth_errorEnterName(), email });
		}
		if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
			return fail(400, { message: m.auth_errorInvalidEmail(), email });
		}
		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: m.auth_errorPasswordTooShort(), email });
		}

		const normalizedEmail = email.toLowerCase().trim();

		try {
			await auth.api.signUpEmail({
				body: { name: name.trim(), email: normalizedEmail, password, locale: getLocale() },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: m.auth_errorEmailTaken(), email });
			}
			throw error;
		}

		redirect(303, safeRedirectTarget(event.url.searchParams.get('redirectTo')));
	}
};
