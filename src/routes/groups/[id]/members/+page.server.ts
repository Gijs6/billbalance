import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getGroupMembers, regenerateJoinCode, requireGroupMembership } from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	const members = await getGroupMembers(params.id);

	return { group: currentGroup, members, origin: url.origin };
};

export const actions: Actions = {
	regenerateCode: async ({ params, locals }) => {
		if (!locals.user) redirect(302, '/login');
		await requireGroupMembership(params.id, locals.user.id);

		await regenerateJoinCode(params.id);

		redirect(303, `/groups/${params.id}/members`);
	}
};
