import type { PageServerLoad } from './$types';
import { getUserGroups } from '$lib/server/groups';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { groups: null };

	const groups = await getUserGroups(locals.user.id);
	return { groups };
};
