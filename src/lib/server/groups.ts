import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { expense, expenseSplit, group, groupMember, settlement, user } from '$lib/server/db/schema';
import type { Group, Settlement } from '$lib/server/db/schema';
import { generateHumanCode } from '$lib/server/id';
import { simplifyDebts } from '$lib/money';

export async function requireGroupMembership(groupId: string, userId: string): Promise<Group> {
	const [row] = await db.select().from(group).where(eq(group.id, groupId));
	if (!row) error(404, 'Group not found');

	const [membership] = await db
		.select()
		.from(groupMember)
		.where(and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)));
	if (!membership) error(404, 'Group not found');

	return row;
}

export function requireOpenGroup(currentGroup: Group): void {
	if (currentGroup.status === 'closed') {
		error(403, 'This group is closed and can no longer be changed.');
	}
}

export interface GroupMemberInfo {
	id: string;
	name: string;
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberInfo[]> {
	const rows = await db
		.select({ id: user.id, name: user.name })
		.from(groupMember)
		.innerJoin(user, eq(groupMember.userId, user.id))
		.where(eq(groupMember.groupId, groupId));
	return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
	const [row] = await db
		.select()
		.from(groupMember)
		.where(and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)));
	return !!row;
}

export async function addGroupMember(groupId: string, userId: string): Promise<void> {
	const already = await isGroupMember(groupId, userId);
	if (already) return;
	await db.insert(groupMember).values({ groupId, userId });
}

export async function computeGroupBalances(groupId: string): Promise<Record<string, number>> {
	const balances: Record<string, number> = {};

	const expenses = await db.select().from(expense).where(eq(expense.groupId, groupId));
	for (const e of expenses) {
		balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amountCents;
	}

	const splits = await db
		.select({
			userId: expenseSplit.userId,
			amountCents: expenseSplit.amountCents,
			expenseId: expenseSplit.expenseId
		})
		.from(expenseSplit)
		.innerJoin(expense, eq(expenseSplit.expenseId, expense.id))
		.where(eq(expense.groupId, groupId));
	for (const s of splits) {
		balances[s.userId] = (balances[s.userId] ?? 0) - s.amountCents;
	}

	return balances;
}

export async function closeGroup(groupId: string): Promise<void> {
	const balances = await computeGroupBalances(groupId);
	const edges = simplifyDebts(balances);

	if (edges.length > 0) {
		await db.insert(settlement).values(
			edges.map((edge) => ({
				groupId,
				fromUser: edge.from,
				toUser: edge.to,
				amountCents: edge.amountCents
			}))
		);
	}

	await db
		.update(group)
		.set({ status: 'closed', closedAt: new Date() })
		.where(eq(group.id, groupId));
}

export interface SettlementWithNames extends Settlement {
	fromName: string;
	toName: string;
}

export async function getGroupSettlements(groupId: string): Promise<SettlementWithNames[]> {
	const rows = await db
		.select({ settlement, fromName: user.name })
		.from(settlement)
		.innerJoin(user, eq(settlement.fromUser, user.id))
		.where(eq(settlement.groupId, groupId));

	const toNames = await getGroupMembers(groupId);
	const toNameMap = new Map(toNames.map((m) => [m.id, m.name]));

	return rows.map((r) => ({
		...r.settlement,
		fromName: r.fromName,
		toName: toNameMap.get(r.settlement.toUser) ?? 'Unknown'
	}));
}

export async function markSettlementPaid(
	settlementId: string,
	actingUserId: string
): Promise<void> {
	const [row] = await db.select().from(settlement).where(eq(settlement.id, settlementId));
	if (!row) error(404, 'Settlement not found');
	if (row.fromUser !== actingUserId && row.toUser !== actingUserId) {
		error(403, 'Only the two people involved in this payment can mark it as paid.');
	}
	if (row.status === 'paid') return;

	await db
		.update(settlement)
		.set({ status: 'paid', paidAt: new Date() })
		.where(eq(settlement.id, settlementId));
}

export async function regenerateJoinCode(groupId: string): Promise<string> {
	const joinCode = generateHumanCode();
	await db.update(group).set({ joinCode }).where(eq(group.id, groupId));
	return joinCode;
}

export async function getUserGroups(userId: string): Promise<Group[]> {
	const rows = await db
		.select({ group })
		.from(groupMember)
		.innerJoin(group, eq(groupMember.groupId, group.id))
		.where(eq(groupMember.userId, userId));
	return rows.map((r) => r.group).sort((a, b) => a.name.localeCompare(b.name));
}
