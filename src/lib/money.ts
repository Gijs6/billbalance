export function splitEqual(
	totalCents: number,
	ids: string[],
	createdAt: number
): Record<string, number> {
	if (ids.length === 0) return {};

	const sortedIds = [...ids].sort();
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

export function formatCents(cents: number, locale: string): string {
	const normalized = cents === 0 ? 0 : cents;
	return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(
		normalized / 100
	);
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
	fromUser: string;
	toUser: string;
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

const SMALL_TRANSFER_CENTS = 200;
const VERY_SMALL_TRANSFER_CENTS = 100;

function settleCluster(entries: BalanceEntry[]): DebtEdge[] {
	const debtors: BalanceEntry[] = [];
	const creditors: BalanceEntry[] = [];
	for (const { id, amountCents } of entries) {
		if (amountCents < 0) debtors.push({ id, amountCents: -amountCents });
		else if (amountCents > 0) creditors.push({ id, amountCents });
	}

	const severity = (amountCents: number) => {
		if (amountCents <= 0) return 0;
		if (amountCents < VERY_SMALL_TRANSFER_CENTS) return 3;
		if (amountCents < SMALL_TRANSFER_CENTS) return 1;
		return 0;
	};

	const pairBadness = (debtor: BalanceEntry, creditor: BalanceEntry, transferred: number) => {
		const leftoverDebtor = debtor.amountCents - transferred;
		const leftoverCreditor = creditor.amountCents - transferred;
		return 2 * severity(transferred) + severity(leftoverDebtor) + severity(leftoverCreditor);
	};

	const edges: DebtEdge[] = [];

	while (debtors.length > 0 && creditors.length > 0) {
		let best: {
			debtor: BalanceEntry;
			creditor: BalanceEntry;
			badness: number;
			transferred: number;
		} | null = null;

		for (const debtor of debtors) {
			for (const creditor of creditors) {
				const transferred = Math.min(debtor.amountCents, creditor.amountCents);
				const badness = pairBadness(debtor, creditor, transferred);
				const better =
					best === null ||
					badness < best.badness ||
					(badness === best.badness &&
						(transferred > best.transferred ||
							(transferred === best.transferred &&
								(debtor.id < best.debtor.id ||
									(debtor.id === best.debtor.id && creditor.id < best.creditor.id)))));
				if (better) best = { debtor, creditor, badness, transferred };
			}
		}

		const { debtor, creditor, transferred } = best!;
		edges.push({ fromUser: debtor.id, toUser: creditor.id, amountCents: transferred });

		debtor.amountCents -= transferred;
		creditor.amountCents -= transferred;

		if (debtor.amountCents === 0) debtors.splice(debtors.indexOf(debtor), 1);
		if (creditor.amountCents === 0) creditors.splice(creditors.indexOf(creditor), 1);
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
