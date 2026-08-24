import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { eq, or, like } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { verifyPassword, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { safeRedirectTarget } from '$lib/server/safe-redirect';

const DUMMY_EMAIL_PATTERNS = ['dummy_%@test.com', 'big_%@test.com'];

function isDummyUser(email: string): boolean {
	return /^(dummy_|big_)[^@]+@test\.com$/.test(email);
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
			return fail(400, { message: 'Please enter your email and password.', email });
		}

		const existing = db.select().from(user).where(eq(user.email, email.toLowerCase().trim())).get();

		if (!existing || !(await verifyPassword(password, existing.passwordHash))) {
			return fail(400, { message: 'Incorrect email or password.', email });
		}

		const { token, expiresAt } = await createSession(existing.id);
		setSessionTokenCookie(event, token, expiresAt);

		redirect(303, safeRedirectTarget(event.url.searchParams.get('redirectTo')));
	},

	dummy: async (event) => {
		if (!dev) return fail(403);

		const form = await event.request.formData();
		const userId = form.get('userId');
		if (typeof userId !== 'string' || !userId) return fail(400);

		const existing = db.select().from(user).where(eq(user.id, userId)).get();
		if (!existing || !isDummyUser(existing.email)) return fail(400);

		const { token, expiresAt } = await createSession(existing.id);
		setSessionTokenCookie(event, token, expiresAt);

		redirect(303, safeRedirectTarget(event.url.searchParams.get('redirectTo')));
	}
};
