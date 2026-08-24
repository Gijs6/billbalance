import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getGroupMembers, requireGroupMembership } from '$lib/server/groups';

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	const members = await getGroupMembers(params.id);

	return { group: currentGroup, members };
};
