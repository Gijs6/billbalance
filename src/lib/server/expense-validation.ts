import { z } from 'zod';
import { parseEuros } from '$lib/money';
import * as m from '$lib/paraglide/messages';

const consumptionSchema = z.object({
	userId: z.string().min(1),
	amountCents: z
		.number()
		.int()
		.positive({ error: () => m.expense_errorConsumedPositive() })
});

const expenseSchema = z
	.object({
		description: z
			.string()
			.trim()
			.min(1, { error: () => m.expense_errorDescriptionRequired() })
			.max(200, { error: () => m.expense_errorDescriptionTooLong() }),
		amountCents: z
			.number()
			.int()
			.positive({ error: () => m.expense_errorAmountPositive() }),
		paidByUser: z.string().min(1, { error: () => m.expense_errorChoosePaidBy() }),
		consumption: z.array(consumptionSchema).min(1, { error: () => m.expense_errorSelectMember() })
	})
	.refine(
		(data) => data.consumption.reduce((sum, c) => sum + c.amountCents, 0) === data.amountCents,
		{
			error: () => m.expense_errorConsumedMismatch(),
			path: ['consumption']
		}
	);

export interface ParsedExpense {
	description: string;
	amountCents: number;
	paidByUser: string;
	consumption: { userId: string; amountCents: number }[];
}

export type ExpenseFormResult =
	{ success: true; data: ParsedExpense } | { success: false; message: string };

export function parseExpenseForm(formData: FormData, memberIds: string[]): ExpenseFormResult {
	const description = formData.get('description');
	const amountRaw = formData.get('amount');
	const paidByUser = formData.get('paidByUser');

	if (typeof amountRaw !== 'string') {
		return { success: false, message: m.expense_errorEnterAmount() };
	}
	const amountCents = parseEuros(amountRaw);
	if (amountCents === null) {
		return { success: false, message: m.expense_errorInvalidAmount() };
	}

	const consumption: { userId: string; amountCents: number }[] = [];
	for (const id of memberIds) {
		if (formData.get(`member_${id}`) === null) continue;

		const consumedRaw = formData.get(`consumed_${id}`);
		if (typeof consumedRaw !== 'string') {
			return {
				success: false,
				message: m.expense_errorEnterConsumedAmount()
			};
		}
		const consumedCents = parseEuros(consumedRaw);
		if (consumedCents === null) {
			return { success: false, message: m.expense_errorInvalidConsumedAmount() };
		}
		consumption.push({ userId: id, amountCents: consumedCents });
	}

	const result = expenseSchema.safeParse({
		description,
		amountCents,
		paidByUser,
		consumption
	});

	if (!result.success) {
		const message = result.error.issues[0]?.message ?? m.expense_errorCheckDetails();
		return { success: false, message };
	}

	if (!memberIds.includes(result.data.paidByUser)) {
		return { success: false, message: m.expense_errorChoosePaidBy() };
	}

	return { success: true, data: result.data };
}
