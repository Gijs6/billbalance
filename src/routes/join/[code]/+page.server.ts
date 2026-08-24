import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { group } from '$lib/server/db/schema';
import { addGroupMember, isGroupMember } from '$lib/server/groups';
import { normalizeHumanCode } from '$lib/human-code';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [found] = await db
		.select()
		.from(group)
		.where(eq(group.joinCode, normalizeHumanCode(params.code)));
	if (!found) error(404, 'This join link is invalid.');

	const alreadyMember = locals.user ? await isGroupMember(found.id, locals.user.id) : false;

	return {
		group: { id: found.id, name: found.name },
		alreadyMember
	};
};

export const actions: Actions = {
	default: async ({ params, locals }) => {
		if (!locals.user) {
			redirect(302, `/login?redirectTo=${encodeURIComponent(`/join/${params.code}`)}`);
		}

		const [found] = await db
			.select()
			.from(group)
			.where(eq(group.joinCode, normalizeHumanCode(params.code)));
		if (!found) error(404, 'This join link is invalid.');

		await addGroupMember(found.id, locals.user.id);

		redirect(303, `/groups/${found.id}`);
	}
};
