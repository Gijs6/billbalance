import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	closeGroup,
	computeGroupBalances,
	getGroupMembers,
	requireGroupMembership
} from '$lib/server/groups';
import { simplifyDebts } from '$lib/money';

async function computeEdges(groupId: string) {
	const balances = await computeGroupBalances(groupId);
	const members = await getGroupMembers(groupId);
	const names = new Map(members.map((m) => [m.id, m.name]));
	const edges = simplifyDebts(balances);
	return edges.map((edge, i) => ({
		id: `${i}`,
		fromUser: edge.from,
		toUser: edge.to,
		fromName: names.get(edge.from) ?? 'Unknown',
		toName: names.get(edge.to) ?? 'Unknown',
		amountCents: edge.amountCents
	}));
}

export const load: PageServerLoad = async ({ params, parent }) => {
	const { group, members } = await parent();
	if (group.status === 'closed') redirect(303, `/groups/${params.id}/settlement`);

	const edges = await computeEdges(params.id);

	const owedTo = new Map<string, typeof edges>();
	const owedBy = new Map<string, typeof edges>();
	for (const edge of edges) {
		if (!owedTo.has(edge.toUser)) owedTo.set(edge.toUser, []);
		owedTo.get(edge.toUser)!.push(edge);
		if (!owedBy.has(edge.fromUser)) owedBy.set(edge.fromUser, []);
		owedBy.get(edge.fromUser)!.push(edge);
	}

	const creditors = members
		.filter((m) => owedTo.has(m.id))
		.map((m) => ({
			id: m.id,
			name: m.name,
			totalCents: owedTo.get(m.id)!.reduce((sum, edge) => sum + edge.amountCents, 0),
			edges: owedTo.get(m.id)!
		}));

	const debtors = members
		.filter((m) => owedBy.has(m.id))
		.map((m) => ({
			id: m.id,
			name: m.name,
			totalCents: owedBy.get(m.id)!.reduce((sum, edge) => sum + edge.amountCents, 0),
			edges: owedBy.get(m.id)!
		}));

	return { group, edges, creditors, debtors };
};

export const actions: Actions = {
	confirm: async ({ params, locals }) => {
		if (!locals.user) redirect(302, '/login');
		const currentGroup = await requireGroupMembership(params.id, locals.user.id);
		if (currentGroup.status === 'closed') error(400, 'This group is already closed.');

		await closeGroup(params.id);

		redirect(303, `/groups/${params.id}/settlement`);
	}
};
