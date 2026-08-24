import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { group } from '$lib/server/db/schema';
import { requireGroupMembership } from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);

	return { group: currentGroup };
};

export const actions: Actions = {
	rename: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		await requireGroupMembership(params.id, locals.user.id);

		const form = await request.formData();
		const name = form.get('name');

		if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
			return fail(400, { renameMessage: 'Please enter a group name.' });
		}

		await db.update(group).set({ name: name.trim() }).where(eq(group.id, params.id));

		redirect(303, `/groups/${params.id}/settings`);
	},

	delete: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		await requireGroupMembership(params.id, locals.user.id);

		const form = await request.formData();
		const confirmed = form.get('confirm') === 'true';

		if (!confirmed) {
			return fail(400, { needsDeleteConfirm: true });
		}

		await db.delete(group).where(eq(group.id, params.id));

		redirect(303, '/');
	}
};
