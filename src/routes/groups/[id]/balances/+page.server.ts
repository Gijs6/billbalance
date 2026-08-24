import type { PageServerLoad } from './$types';
import { computeGroupBalanceBreakdown } from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { group, members } = await parent();
	const breakdown = await computeGroupBalanceBreakdown(params.id);

	const membersWithBalance = members
		.map((m) => {
			const { paidCents, consumedCents } = breakdown[m.id] ?? { paidCents: 0, consumedCents: 0 };
			return { ...m, paidCents, consumedCents, balanceCents: paidCents - consumedCents };
		})
		.sort((a, b) => b.balanceCents - a.balanceCents);

	return {
		members: membersWithBalance,
		isClosed: group.status === 'closed'
	};
};
