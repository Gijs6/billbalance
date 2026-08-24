import { and, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expense, expenseConsumption } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { group, members } = await parent();
	const userId = locals.user!.id;

	const expenseRows = await db
		.select()
		.from(expense)
		.where(eq(expense.groupId, params.id))
		.orderBy(desc(expense.createdAt));

	const myConsumption = await db
		.select({
			expenseId: expenseConsumption.expenseId,
			amountCents: expenseConsumption.amountCents
		})
		.from(expenseConsumption)
		.innerJoin(expense, eq(expenseConsumption.expenseId, expense.id))
		.where(and(eq(expense.groupId, params.id), eq(expenseConsumption.userId, userId)));
	const myConsumptionByExpense = new Map(myConsumption.map((c) => [c.expenseId, c.amountCents]));

	const memberNames = new Map(members.map((m) => [m.id, m.name]));

	return {
		expenses: expenseRows.map((e) => {
			const paidCents = e.paidByUser === userId ? e.amountCents : 0;
			const consumedCents = myConsumptionByExpense.get(e.id) ?? 0;
			return {
				id: e.id,
				description: e.description,
				amountCents: e.amountCents,
				paidByName: e.paidByUser === userId ? 'you' : (memberNames.get(e.paidByUser) ?? 'Unknown'),
				createdAt: e.createdAt,
				myEffectCents: paidCents - consumedCents
			};
		}),
		isClosed: group.status === 'closed'
	};
};
