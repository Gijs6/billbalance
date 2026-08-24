import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { createPasswordResetToken } from '$lib/server/password-reset';
import { sendPasswordResetEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = form.get('email');

		if (typeof email !== 'string' || !email) {
			return fail(400, { message: 'Please enter your email.' });
		}

		const existing = db.select().from(user).where(eq(user.email, email.toLowerCase().trim())).get();

		if (existing) {
			const token = await createPasswordResetToken(existing.id);
			const resetUrl = `${event.url.origin}/reset-password/${token}`;
			await sendPasswordResetEmail(existing.email, resetUrl);
		}

		return { sent: true };
	}
};
