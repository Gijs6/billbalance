import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions } from './$types';
import { auth } from '$lib/server/auth';
import * as m from '$lib/paraglide/messages';

export const actions: Actions = {
	default: async ({ params, request }) => {
		const form = await request.formData();
		const password = form.get('password');

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: m.auth_errorPasswordTooShort() });
		}

		try {
			await auth.api.resetPassword({
				body: { newPassword: password, token: params.token }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: m.auth_resetInvalidToken() });
			}
			throw error;
		}

		redirect(302, '/login');
	}
};
