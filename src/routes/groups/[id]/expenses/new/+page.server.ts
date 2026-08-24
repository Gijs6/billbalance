import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expense, expenseSplit } from '$lib/server/db/schema';
import { getGroupMembers, requireGroupMembership, requireOpenGroup } from '$lib/server/groups';
import { parseExpenseForm } from '$lib/server/expense-validation';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	requireOpenGroup(currentGroup);
	const members = await getGroupMembers(params.id);

	return { members, currentUserId: locals.user.id };
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		const currentGroup = await requireGroupMembership(params.id, locals.user.id);
		requireOpenGroup(currentGroup);

		const members = await getGroupMembers(params.id);
		const formData = await request.formData();
		const result = parseExpenseForm(
			formData,
			members.map((m) => m.id)
		);

		if (!result.success) {
			return fail(400, { message: result.message });
		}

		const [newExpense] = await db
			.insert(expense)
			.values({
				groupId: params.id,
				description: result.data.description,
				amountCents: result.data.amountCents,
				paidBy: result.data.paidBy,
				createdBy: locals.user.id
			})
			.returning();

		await db.insert(expenseSplit).values(
			result.data.splits.map((s) => ({
				expenseId: newExpense.id,
				userId: s.userId,
				amountCents: s.amountCents
			}))
		);

		redirect(303, `/groups/${params.id}`);
	}
};
