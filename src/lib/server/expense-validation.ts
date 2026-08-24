import { z } from 'zod';
import { parseEuros } from '$lib/money';

const splitSchema = z.object({
	userId: z.string().min(1),
	amountCents: z.number().int().positive('Each participant’s share must be greater than zero.')
});

const expenseSchema = z
	.object({
		description: z
			.string()
			.trim()
			.min(1, 'Please enter a description.')
			.max(200, 'Description is too long.'),
		amountCents: z.number().int().positive('Please enter an amount greater than zero.'),
		paidBy: z.string().min(1, 'Please choose who paid.'),
		splits: z.array(splitSchema).min(1, 'Select at least one participant.')
	})
	.refine((data) => data.splits.reduce((sum, s) => sum + s.amountCents, 0) === data.amountCents, {
		message: 'Split amounts must add up to the total amount.',
		path: ['splits']
	});

export interface ParsedExpense {
	description: string;
	amountCents: number;
	paidBy: string;
	splits: { userId: string; amountCents: number }[];
}

export type ExpenseFormResult =
	{ success: true; data: ParsedExpense } | { success: false; message: string };

export function parseExpenseForm(formData: FormData, memberIds: string[]): ExpenseFormResult {
	const description = formData.get('description');
	const amountRaw = formData.get('amount');
	const paidBy = formData.get('paidBy');

	if (typeof amountRaw !== 'string') {
		return { success: false, message: 'Please enter an amount.' };
	}
	const amountCents = parseEuros(amountRaw);
	if (amountCents === null) {
		return { success: false, message: 'Please enter a valid amount, e.g. 12.34.' };
	}

	const splits: { userId: string; amountCents: number }[] = [];
	for (const id of memberIds) {
		if (formData.get(`participant_${id}`) === null) continue;

		const shareRaw = formData.get(`share_${id}`);
		if (typeof shareRaw !== 'string') {
			return {
				success: false,
				message: 'Please enter a share amount for each selected participant.'
			};
		}
		const shareCents = parseEuros(shareRaw);
		if (shareCents === null) {
			return { success: false, message: 'Please enter valid share amounts, e.g. 12.34.' };
		}
		splits.push({ userId: id, amountCents: shareCents });
	}

	const result = expenseSchema.safeParse({
		description,
		amountCents,
		paidBy,
		splits
	});

	if (!result.success) {
		const message = result.error.issues[0]?.message ?? 'Please check the expense details.';
		return { success: false, message };
	}

	if (!memberIds.includes(result.data.paidBy)) {
		return { success: false, message: 'Please choose who paid.' };
	}

	return { success: true, data: result.data };
}
