import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getGroupSettlements,
	markSettlementPaid,
	requireGroupMembership
} from '$lib/server/groups';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { group, members } = await parent();
	if (group.status !== 'closed') redirect(303, `/groups/${params.id}/expenses`);

	const settlements = await getGroupSettlements(params.id);

	const owedTo = new Map<string, typeof settlements>();
	const owedBy = new Map<string, typeof settlements>();
	for (const s of settlements) {
		if (!owedTo.has(s.toUser)) owedTo.set(s.toUser, []);
		owedTo.get(s.toUser)!.push(s);
		if (!owedBy.has(s.fromUser)) owedBy.set(s.fromUser, []);
		owedBy.get(s.fromUser)!.push(s);
	}

	const creditors = members
		.filter((m) => owedTo.has(m.id))
		.map((m) => ({
			id: m.id,
			name: m.name,
			totalCents: owedTo.get(m.id)!.reduce((sum, s) => sum + s.amountCents, 0),
			edges: owedTo.get(m.id)!
		}));

	const debtors = members
		.filter((m) => owedBy.has(m.id))
		.map((m) => ({
			id: m.id,
			name: m.name,
			totalCents: owedBy.get(m.id)!.reduce((sum, s) => sum + s.amountCents, 0),
			edges: owedBy.get(m.id)!
		}));

	return { group, settlements, creditors, debtors };
};

export const actions: Actions = {
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
