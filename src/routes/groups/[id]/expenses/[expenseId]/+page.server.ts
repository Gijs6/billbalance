import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expense, expenseSplit } from '$lib/server/db/schema';
import { getGroupMembers, requireGroupMembership, requireOpenGroup } from '$lib/server/groups';
import { parseExpenseForm } from '$lib/server/expense-validation';

async function loadExpense(groupId: string, expenseId: string) {
	const [row] = await db
		.select()
		.from(expense)
		.where(and(eq(expense.id, expenseId), eq(expense.groupId, groupId)));
	if (!row) error(404, 'Expense not found');
	return row;
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

	const currentGroup = await requireGroupMembership(params.id, locals.user.id);
	const currentExpense = await loadExpense(params.id, params.expenseId);
	const members = await getGroupMembers(params.id);
	const splits = await db
		.select()
		.from(expenseSplit)
		.where(eq(expenseSplit.expenseId, params.expenseId));

	return { expense: currentExpense, members, splits, isClosed: currentGroup.status === 'closed' };
};

export const actions: Actions = {
	update: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		const currentGroup = await requireGroupMembership(params.id, locals.user.id);
		requireOpenGroup(currentGroup);
		await loadExpense(params.id, params.expenseId);

		const members = await getGroupMembers(params.id);
		const formData = await request.formData();
		const result = parseExpenseForm(
			formData,
			members.map((m) => m.id)
		);

		if (!result.success) {
			return fail(400, { message: result.message });
		}

		await db
			.update(expense)
			.set({
				description: result.data.description,
				amountCents: result.data.amountCents,
				paidBy: result.data.paidBy
			})
			.where(eq(expense.id, params.expenseId));

		await db.delete(expenseSplit).where(eq(expenseSplit.expenseId, params.expenseId));
		await db.insert(expenseSplit).values(
			result.data.splits.map((s) => ({
				expenseId: params.expenseId,
				userId: s.userId,
				amountCents: s.amountCents
			}))
		);

		redirect(303, `/groups/${params.id}`);
	},

	delete: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/login');
		const currentGroup = await requireGroupMembership(params.id, locals.user.id);
		requireOpenGroup(currentGroup);
		await loadExpense(params.id, params.expenseId);

		const formData = await request.formData();
		const confirmed = formData.get('confirm') === 'true';

		if (!confirmed) {
			return fail(400, { needsDeleteConfirm: true });
		}

		await db.delete(expense).where(eq(expense.id, params.expenseId));

		redirect(303, `/groups/${params.id}`);
	}
};
