export function splitEqual(
	totalCents: number,
	userIds: string[],
	createdAt: number
): Record<string, number> {
	if (userIds.length === 0) return {};

	const sortedIds = [...userIds].sort();
	const base = Math.floor(totalCents / sortedIds.length);
	const remainder = totalCents - base * sortedIds.length;
	const offset = createdAt % sortedIds.length;

	const result: Record<string, number> = {};
	for (const [index, id] of sortedIds.entries()) {
		const rotatedIndex = (index - offset + sortedIds.length) % sortedIds.length;
		result[id] = base + (rotatedIndex < remainder ? 1 : 0);
	}
	return result;
}

export function formatCents(cents: number): string {
	const sign = cents < 0 ? '-' : '';
	const abs = Math.abs(cents);
	const euros = Math.floor(abs / 100);
	const remainder = abs % 100;
	return `${sign}€${euros.toLocaleString('en-US')}.${remainder.toString().padStart(2, '0')}`;
}

export function centsToInputValue(cents: number): string {
	const euros = Math.floor(cents / 100);
	const remainder = cents % 100;
	return `${euros}.${remainder.toString().padStart(2, '0')}`;
}

export function parseEuros(input: string): number | null {
	const normalized = input.trim().replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
	const cents = Math.round(Number(normalized) * 100);
	return Number.isFinite(cents) ? cents : null;
}

export interface DebtEdge {
	from: string;
	to: string;
	amountCents: number;
}

type BalanceEntry = { id: string; amountCents: number };

const MAX_CLUSTER_SEARCH_SIZE = 20;

function findZeroSumClusters(entries: BalanceEntry[]): BalanceEntry[][] {
	if (entries.length <= 1 || entries.length > MAX_CLUSTER_SEARCH_SIZE) {
		return [entries];
	}

	const subsetCount = 1 << entries.length;
	for (let mask = 1; mask < subsetCount - 1; mask++) {
		let sum = 0;
		for (let i = 0; i < entries.length; i++) {
			if (mask & (1 << i)) sum += entries[i].amountCents;
		}
		if (sum === 0) {
			const inSubset: BalanceEntry[] = [];
			const rest: BalanceEntry[] = [];
			for (let i = 0; i < entries.length; i++) {
				(mask & (1 << i) ? inSubset : rest).push(entries[i]);
			}
			return [...findZeroSumClusters(inSubset), ...findZeroSumClusters(rest)];
		}
	}

	return [entries];
}

function settleCluster(entries: BalanceEntry[]): DebtEdge[] {
	type Entry = { id: string; amountCents: number };

	const debtors: Entry[] = [];
	const creditors: Entry[] = [];
	for (const { id, amountCents } of entries) {
		if (amountCents < 0) debtors.push({ id, amountCents: -amountCents });
		else if (amountCents > 0) creditors.push({ id, amountCents });
	}

	const byAmountThenId = (a: Entry, b: Entry) =>
		b.amountCents - a.amountCents || a.id.localeCompare(b.id);

	const edges: DebtEdge[] = [];

	while (debtors.length > 0 && creditors.length > 0) {
		debtors.sort(byAmountThenId);
		creditors.sort(byAmountThenId);

		const debtor = debtors[0];
		const creditor = creditors[0];
		const amountCents = Math.min(debtor.amountCents, creditor.amountCents);

		edges.push({ from: debtor.id, to: creditor.id, amountCents });

		debtor.amountCents -= amountCents;
		creditor.amountCents -= amountCents;

		if (debtor.amountCents === 0) debtors.shift();
		if (creditor.amountCents === 0) creditors.shift();
	}

	return edges;
}

export function simplifyDebts(balances: Record<string, number>): DebtEdge[] {
	const entries: BalanceEntry[] = Object.entries(balances)
		.filter(([, amountCents]) => amountCents !== 0)
		.map(([id, amountCents]) => ({ id, amountCents }));

	const edges: DebtEdge[] = [];
	for (const cluster of findZeroSumClusters(entries)) {
		edges.push(...settleCluster(cluster));
	}
	return edges;
}
