import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { hashPassword, invalidateAllSessionsForUser } from '$lib/server/auth';
import {
	validatePasswordResetToken,
	invalidatePasswordResetToken
} from '$lib/server/password-reset';

export const load: PageServerLoad = async ({ params }) => {
	const userId = await validatePasswordResetToken(params.token);
	if (!userId) {
		error(400, 'This password reset link is invalid or has expired.');
	}
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const userId = await validatePasswordResetToken(params.token);
		if (!userId) {
			error(400, 'This password reset link is invalid or has expired.');
		}

		const form = await request.formData();
		const password = form.get('password');

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}

		const passwordHash = await hashPassword(password);
		await db.update(user).set({ passwordHash }).where(eq(user.id, userId));

		await invalidatePasswordResetToken(params.token);
		await invalidateAllSessionsForUser(userId);

		redirect(302, '/login');
	}
};
