import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGroupMembers, requireGroupMembership } from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	const members = await getGroupMembers(params.id);
	const membersByJoinDate = [...members].sort(
		(a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
	);

	return { group: currentGroup, members: membersByJoinDate, origin: url.origin };
};
