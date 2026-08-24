import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions } from './$types';
import { auth } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ params, request }) => {
		const form = await request.formData();
		const password = form.get('password');

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}

		try {
			await auth.api.resetPassword({
				body: { newPassword: password, token: params.token }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: 'This password reset link is invalid or has expired.' });
			}
			throw error;
		}

		redirect(302, '/login');
	}
};
