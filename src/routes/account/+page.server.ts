import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { passwordResetToken, session, user } from '$lib/server/db/schema';
import {
	deleteSessionTokenCookie,
	hashPassword,
	invalidateOtherSessionsForUser,
	verifyPassword
} from '$lib/server/auth';
import { setFlash } from '$lib/server/flash';
import { getUserGroups } from '$lib/server/groups';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const groups = await getUserGroups(locals.user.id);

	return { user: locals.user, groups };
};

export const actions: Actions = {
	updateName: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const form = await request.formData();
		const name = form.get('name');

		if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
			return fail(400, { nameMessage: 'Please enter your name.' });
		}

		await db.update(user).set({ name: name.trim() }).where(eq(user.id, locals.user.id));

		redirect(303, '/account');
	},

	changePassword: async ({ request, locals, cookies }) => {
		if (!locals.user || !locals.session) redirect(302, '/login');

		const form = await request.formData();
		const currentPassword = form.get('currentPassword');
		const newPassword = form.get('newPassword');
		const confirmPassword = form.get('confirmPassword');

		if (typeof currentPassword !== 'string' || !currentPassword) {
			return fail(400, { passwordMessage: 'Please enter your current password.' });
		}
		if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 255) {
			return fail(400, { passwordMessage: 'New password must be at least 8 characters.' });
		}
		if (newPassword !== confirmPassword) {
			return fail(400, { passwordMessage: 'New passwords do not match.' });
		}
		if (!(await verifyPassword(currentPassword, locals.user.passwordHash))) {
			return fail(400, { passwordMessage: 'Current password is incorrect.' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db.update(user).set({ passwordHash }).where(eq(user.id, locals.user.id));
		await invalidateOtherSessionsForUser(locals.user.id, locals.session.id);

		setFlash(cookies, 'Password updated.');
		redirect(303, '/account');
	},

	delete: async (event) => {
		const { request, locals } = event;
		if (!locals.user) redirect(302, '/login');

		const groups = await getUserGroups(locals.user.id);
		if (groups.length > 0) {
			return fail(400, {
				deleteMessage: 'Leave or delete all your groups before deleting your account.'
			});
		}

		const form = await request.formData();
		const confirmed = form.get('confirm') === 'true';

		if (!confirmed) {
			return fail(400, { needsDeleteConfirm: true });
		}

		await db.delete(passwordResetToken).where(eq(passwordResetToken.userId, locals.user.id));
		await db.delete(session).where(eq(session.userId, locals.user.id));
		await db.delete(user).where(eq(user.id, locals.user.id));

		deleteSessionTokenCookie(event);
		redirect(303, '/');
	}
};
