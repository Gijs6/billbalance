import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
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

		await auth.api.updateUser({ body: { name: name.trim() }, headers: request.headers });

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

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword, revokeOtherSessions: true },
				headers: request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { passwordMessage: 'Current password is incorrect.' });
			}
			throw error;
		}

		setFlash(cookies, 'Password updated.');
		redirect(303, '/account');
	},

	delete: async ({ request, locals }) => {
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

		await auth.api.deleteUser({ body: {}, headers: request.headers });

		redirect(303, '/');
	}
};
