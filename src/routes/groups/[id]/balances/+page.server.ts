import type { PageServerLoad } from './$types';
import { computeGroupBalances } from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { group, members } = await parent();
	const balances = await computeGroupBalances(params.id);

	return {
		members: members.map((m) => ({ ...m, balanceCents: balances[m.id] ?? 0 })),
		isClosed: group.status === 'closed'
	};
};
