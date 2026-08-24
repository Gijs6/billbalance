import { and, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expense, expenseSplit } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { group, members } = await parent();
	const userId = locals.user!.id;

	const expenseRows = await db
		.select()
		.from(expense)
		.where(eq(expense.groupId, params.id))
		.orderBy(desc(expense.createdAt));

	const mySplits = await db
		.select({ expenseId: expenseSplit.expenseId, amountCents: expenseSplit.amountCents })
		.from(expenseSplit)
		.innerJoin(expense, eq(expenseSplit.expenseId, expense.id))
		.where(and(eq(expense.groupId, params.id), eq(expenseSplit.userId, userId)));
	const mySplitByExpense = new Map(mySplits.map((s) => [s.expenseId, s.amountCents]));

	const memberNames = new Map(members.map((m) => [m.id, m.name]));

	return {
		expenses: expenseRows.map((e) => {
			const paidShare = e.paidBy === userId ? e.amountCents : 0;
			const owedShare = mySplitByExpense.get(e.id) ?? 0;
			return {
				id: e.id,
				description: e.description,
				amountCents: e.amountCents,
				paidByName: memberNames.get(e.paidBy) ?? 'Unknown',
				createdAt: e.createdAt,
				myEffectCents: paidShare - owedShare
			};
		}),
		isClosed: group.status === 'closed'
	};
};
