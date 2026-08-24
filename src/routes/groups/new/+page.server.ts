import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { group, groupMember } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login?redirectTo=/groups/new');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const form = await request.formData();
		const name = form.get('name');

		if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
			return fail(400, {
				message: 'Please enter a group name.',
				name: typeof name === 'string' ? name : ''
			});
		}

		const [newGroup] = await db
			.insert(group)
			.values({ name: name.trim(), createdBy: locals.user.id })
			.returning();

		await db.insert(groupMember).values({ groupId: newGroup.id, userId: locals.user.id });

		redirect(303, `/groups/${newGroup.id}`);
	}
};
