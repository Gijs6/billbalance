import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expense, expenseConsumption } from '$lib/server/db/schema';
import { getGroupMembers, requireGroupMembership, requireOpenGroup } from '$lib/server/groups';
import { parseExpenseForm } from '$lib/server/expense-validation';
import { setFlash } from '$lib/server/flash';

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
	const consumption = await db
		.select()
		.from(expenseConsumption)
		.where(eq(expenseConsumption.expenseId, params.expenseId));

	return {
		expense: currentExpense,
		members,
		consumption,
		isClosed: currentGroup.status === 'closed'
	};
};

export const actions: Actions = {
	update: async ({ params, request, locals, cookies }) => {
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
				paidByUser: result.data.paidByUser
			})
			.where(eq(expense.id, params.expenseId));

		await db.delete(expenseConsumption).where(eq(expenseConsumption.expenseId, params.expenseId));
		await db.insert(expenseConsumption).values(
			result.data.consumption.map((c) => ({
				expenseId: params.expenseId,
				userId: c.userId,
				amountCents: c.amountCents
			}))
		);

		setFlash(cookies, 'Expense updated.');
		redirect(303, `/groups/${params.id}`);
	},

	delete: async ({ params, request, locals, cookies }) => {
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

		setFlash(cookies, 'Expense deleted.');
		redirect(303, `/groups/${params.id}`);
	}
};
