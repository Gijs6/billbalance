import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getGroupMembers, getGroupSettlements, requireGroupMembership } from '$lib/server/groups';

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	const members = await getGroupMembers(params.id);

	let allSettled = false;
	if (currentGroup.status === 'closed') {
		const settlements = await getGroupSettlements(params.id);
		allSettled = settlements.every((s) => s.status === 'paid');
	}

	return { group: currentGroup, members, allSettled };
};
