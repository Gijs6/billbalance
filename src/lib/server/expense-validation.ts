import { z } from 'zod';
import { parseEuros } from '$lib/money';

const consumptionSchema = z.object({
	userId: z.string().min(1),
	amountCents: z.number().int().positive("Each member's consumed amount must be greater than zero.")
});

const expenseSchema = z
	.object({
		description: z
			.string()
			.trim()
			.min(1, 'Please enter a description.')
			.max(200, 'Description is too long.'),
		amountCents: z.number().int().positive('Please enter an amount greater than zero.'),
		paidByUser: z.string().min(1, 'Please choose who paid.'),
		consumption: z.array(consumptionSchema).min(1, 'Select at least one member.')
	})
	.refine(
		(data) => data.consumption.reduce((sum, c) => sum + c.amountCents, 0) === data.amountCents,
		{
			message: 'Consumed amounts must add up to the total amount.',
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
		return { success: false, message: 'Please enter an amount.' };
	}
	const amountCents = parseEuros(amountRaw);
	if (amountCents === null) {
		return { success: false, message: 'Please enter a valid amount, e.g. 12.34.' };
	}

	const consumption: { userId: string; amountCents: number }[] = [];
	for (const id of memberIds) {
		if (formData.get(`member_${id}`) === null) continue;

		const consumedRaw = formData.get(`consumed_${id}`);
		if (typeof consumedRaw !== 'string') {
			return {
				success: false,
				message: 'Please enter a consumed amount for each selected member.'
			};
		}
		const consumedCents = parseEuros(consumedRaw);
		if (consumedCents === null) {
			return { success: false, message: 'Please enter valid consumed amounts, e.g. 12.34.' };
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
		const message = result.error.issues[0]?.message ?? 'Please check the expense details.';
		return { success: false, message };
	}

	if (!memberIds.includes(result.data.paidByUser)) {
		return { success: false, message: 'Please choose who paid.' };
	}

	return { success: true, data: result.data };
}
