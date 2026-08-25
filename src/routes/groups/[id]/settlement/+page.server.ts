import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	closeGroup,
	computeGroupBalances,
	getGroupMembers,
	getGroupSettlements,
	markSettlementPaid,
	requireGroupMembership
} from '$lib/server/groups';
import type { GroupMemberInfo } from '$lib/server/groups';
import { simplifyDebts } from '$lib/money';
import { setFlash } from '$lib/server/flash';

interface EdgeLike {
	id: string;
	fromUser: string;
	toUser: string;
	fromName: string;
	toName: string;
	amountCents: number;
	status: 'pending' | 'paid';
}

async function computePreviewEdges(groupId: string): Promise<EdgeLike[]> {
	const balances = await computeGroupBalances(groupId);
	const members = await getGroupMembers(groupId);
	const names = new Map(members.map((m) => [m.id, m.name]));
	const edges = simplifyDebts(balances);
	return edges.map((edge, i) => ({
		id: `${i}`,
		fromUser: edge.fromUser,
		toUser: edge.toUser,
		fromName: names.get(edge.fromUser) ?? 'Unknown',
		toName: names.get(edge.toUser) ?? 'Unknown',
		amountCents: edge.amountCents,
		status: 'pending' as const
	}));
}

function groupByCreditorDebtor(members: GroupMemberInfo[], edges: EdgeLike[]) {
	const owedTo = new Map<string, EdgeLike[]>();
	const owedBy = new Map<string, EdgeLike[]>();
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
		}))
		.sort((a, b) => b.totalCents - a.totalCents);

	const debtors = members
		.filter((m) => owedBy.has(m.id))
		.map((m) => ({
			id: m.id,
			name: m.name,
			totalCents: owedBy.get(m.id)!.reduce((sum, edge) => sum + edge.amountCents, 0),
			edges: owedBy.get(m.id)!
		}))
		.sort((a, b) => b.totalCents - a.totalCents);

	return { creditors, debtors };
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { group, members } = await parent();

	if (group.status === 'closed') {
		const settlements = await getGroupSettlements(params.id);
		const currentUserId = locals.user?.id;
		const myReceivables = settlements.filter((s) => s.toUser === currentUserId);
		const myPayables = settlements.filter((s) => s.fromUser === currentUserId);
		const { creditors, debtors } = groupByCreditorDebtor(members, settlements);

		return {
			group,
			isClosed: true as const,
			settlements,
			creditors,
			debtors,
			myReceivables,
			myPayables
		};
	}

	const edges = await computePreviewEdges(params.id);
	const { creditors, debtors } = groupByCreditorDebtor(members, edges);

	return { group, isClosed: false as const, edges, creditors, debtors };
};

export const actions: Actions = {
	confirm: async ({ params, locals, cookies }) => {
		if (!locals.user) redirect(302, '/login');
		const currentGroup = await requireGroupMembership(params.id, locals.user.id);
		if (currentGroup.status === 'closed') error(400, 'This group is already closed.');

		await closeGroup(params.id);

		setFlash(cookies, 'Group closed and settled.');
		redirect(303, `/groups/${params.id}/settlement`);
	},

	markPaid: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		await requireGroupMembership(params.id, locals.user.id);

		const form = await request.formData();
		const settlementId = form.get('settlementId');
		if (typeof settlementId !== 'string' || !settlementId) {
			return fail(400, { message: 'Missing settlement id.' });
		}

		await markSettlementPaid(settlementId, locals.user.id);

		return { success: true };
	}
};
