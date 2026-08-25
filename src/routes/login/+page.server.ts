import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { eq, or, like } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { safeRedirectTarget } from '$lib/server/safe-redirect';
import * as m from '$lib/paraglide/messages';

const DUMMY_EMAIL_PATTERNS = ['seed%@test.com'];

function isDummyUser(email: string): boolean {
	return /^seed[^@]+@test\.com$/.test(email);
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(302, safeRedirectTarget(url.searchParams.get('redirectTo')));

	const dummyUsers = dev
		? db
				.select({ id: user.id, name: user.name })
				.from(user)
				.where(or(...DUMMY_EMAIL_PATTERNS.map((pattern) => like(user.email, pattern))))
				.all()
		: [];

	return { redirectTo: url.searchParams.get('redirectTo') ?? '', dummyUsers };
};

export const actions: Actions = {
	login: async (event) => {
		const form = await event.request.formData();
		const email = form.get('email');
		const password = form.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, { message: m.auth_errorEnterEmailPassword(), email });
		}

		try {
			await auth.api.signInEmail({
				body: { email: email.toLowerCase().trim(), password },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: m.auth_errorIncorrectCredentials(), email });
			}
			throw error;
		}

		redirect(303, safeRedirectTarget(event.url.searchParams.get('redirectTo')));
	},

	dummy: async (event) => {
		if (!dev) return fail(403);

		const form = await event.request.formData();
		const userId = form.get('userId');
		if (typeof userId !== 'string' || !userId) return fail(400);

		const existing = db.select().from(user).where(eq(user.id, userId)).get();
		if (!existing || !isDummyUser(existing.email)) return fail(400);

		await auth.api.signInEmail({
			body: { email: existing.email, password: 'testtest' },
			headers: event.request.headers
		});

		redirect(303, safeRedirectTarget(event.url.searchParams.get('redirectTo')));
	}
};
