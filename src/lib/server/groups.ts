import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	expense,
	expenseConsumption,
	group,
	groupMember,
	settlement,
	user
} from '$lib/server/db/schema';
import type { Group, Settlement } from '$lib/server/db/schema';
import { simplifyDebts } from '$lib/money';
import * as m from '$lib/paraglide/messages';

export async function requireGroupMembership(groupId: string, userId: string): Promise<Group> {
	const [row] = await db.select().from(group).where(eq(group.id, groupId));
	if (!row) error(404, m.group_notFoundError());

	const [membership] = await db
		.select()
		.from(groupMember)
		.where(and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)));
	if (!membership) error(404, m.group_notFoundError());

	return row;
}

export function requireOpenGroup(currentGroup: Group): void {
	if (currentGroup.status === 'closed') {
		error(403, m.group_closedError());
	}
}

export interface GroupMemberInfo {
	id: string;
	name: string;
	joinedAt: Date;
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberInfo[]> {
	const rows = await db
		.select({ id: user.id, name: user.name, joinedAt: groupMember.joinedAt })
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

export interface GroupBalanceBreakdown {
	paidCents: number;
	consumedCents: number;
}

export async function computeGroupBalanceBreakdown(
	groupId: string
): Promise<Record<string, GroupBalanceBreakdown>> {
	const breakdown: Record<string, GroupBalanceBreakdown> = {};
	const ensure = (id: string) => (breakdown[id] ??= { paidCents: 0, consumedCents: 0 });

	const expenses = await db.select().from(expense).where(eq(expense.groupId, groupId));
	for (const e of expenses) {
		ensure(e.paidByUser).paidCents += e.amountCents;
	}

	const consumptions = await db
		.select({
			userId: expenseConsumption.userId,
			amountCents: expenseConsumption.amountCents,
			expenseId: expenseConsumption.expenseId
		})
		.from(expenseConsumption)
		.innerJoin(expense, eq(expenseConsumption.expenseId, expense.id))
		.where(eq(expense.groupId, groupId));
	for (const c of consumptions) {
		ensure(c.userId).consumedCents += c.amountCents;
	}

	return breakdown;
}

export async function computeGroupBalances(groupId: string): Promise<Record<string, number>> {
	const breakdown = await computeGroupBalanceBreakdown(groupId);
	const balances: Record<string, number> = {};
	for (const [id, { paidCents, consumedCents }] of Object.entries(breakdown)) {
		balances[id] = paidCents - consumedCents;
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
				fromUser: edge.fromUser,
				toUser: edge.toUser,
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
		toName: toNameMap.get(r.settlement.toUser) ?? m.common_unknown()
	}));
}

export async function markSettlementPaid(
	settlementId: string,
	actingUserId: string
): Promise<void> {
	const [row] = await db.select().from(settlement).where(eq(settlement.id, settlementId));
	if (!row) error(404, m.settlement_notFoundError());
	if (row.fromUser !== actingUserId && row.toUser !== actingUserId) {
		error(403, m.settlement_markPaidForbiddenError());
	}
	if (row.status === 'paid') return;

	await db
		.update(settlement)
		.set({ status: 'paid', paidAt: new Date() })
		.where(eq(settlement.id, settlementId));
}

export async function getUserGroups(userId: string): Promise<Group[]> {
	const rows = await db
		.select({ group })
		.from(groupMember)
		.innerJoin(group, eq(groupMember.groupId, group.id))
		.where(eq(groupMember.userId, userId));
	return rows.map((r) => r.group).sort((a, b) => a.name.localeCompare(b.name));
}
