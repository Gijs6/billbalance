import { describe, expect, it } from 'vitest';
import { centsToInputValue, formatCents, parseEuros, simplifyDebts, splitEqual } from './money';

describe('splitEqual', () => {
	const CREATED_AT = Date.parse('2024-01-01T10:00:00.000Z');

	it('splits evenly when it divides cleanly', () => {
		expect(splitEqual(900, ['a', 'b', 'c'], CREATED_AT)).toEqual({ a: 300, b: 300, c: 300 });
	});

	it('distributes the remainder based on the creation timestamp', () => {
		expect(splitEqual(1000, ['c', 'a', 'b'], CREATED_AT)).toEqual({ a: 334, b: 333, c: 333 });
		expect(splitEqual(1000, ['c', 'a', 'b'], CREATED_AT + 1)).toEqual({ a: 333, b: 334, c: 333 });
		expect(splitEqual(1000, ['c', 'a', 'b'], CREATED_AT + 2)).toEqual({ a: 333, b: 333, c: 334 });
	});

	it('varies which participant absorbs the remainder across different expenses', () => {
		const timestamps = [0, 1, 2, 3, 4, 5].map((offset) => CREATED_AT + offset);
		const whoGotExtra = new Set(
			timestamps.map((createdAt) => {
				const shares = splitEqual(1000, ['a', 'b', 'c'], createdAt);
				return Object.entries(shares).find(([, cents]) => cents === 334)?.[0];
			})
		);
		expect(whoGotExtra.size).toBeGreaterThan(1);
	});

	it('gives the same result regardless of input order, for a fixed timestamp', () => {
		const result1 = splitEqual(1001, ['x', 'y', 'z'], CREATED_AT);
		const result2 = splitEqual(1001, ['z', 'x', 'y'], CREATED_AT);
		expect(result1).toEqual(result2);
	});

	it('is deterministic for a given timestamp', () => {
		expect(splitEqual(1001, ['x', 'y', 'z'], CREATED_AT)).toEqual(
			splitEqual(1001, ['x', 'y', 'z'], CREATED_AT)
		);
	});

	it('is exhaustive: shares always sum back to the total', () => {
		const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		for (const total of [0, 1, 7, 100, 1001, 9999]) {
			const shares = splitEqual(total, ids, CREATED_AT);
			const sum = Object.values(shares).reduce((a, b) => a + b, 0);
			expect(sum).toBe(total);
		}
	});

	it('returns an empty object for no participants', () => {
		expect(splitEqual(1000, [], CREATED_AT)).toEqual({});
	});

	it('handles a single participant', () => {
		expect(splitEqual(1234, ['a'], CREATED_AT)).toEqual({ a: 1234 });
	});

	it('handles a total of zero', () => {
		expect(splitEqual(0, ['a', 'b', 'c'], CREATED_AT)).toEqual({ a: 0, b: 0, c: 0 });
	});

	it('handles a total smaller than the participant count', () => {
		expect(splitEqual(2, ['a', 'b', 'c'], CREATED_AT)).toEqual({ a: 1, b: 1, c: 0 });
	});

	it('gives everyone the same share when it divides by a large group', () => {
		const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
		const shares = splitEqual(1000, ids, CREATED_AT);
		expect(Object.values(shares)).toEqual(Array(10).fill(100));
	});

	it('never gives more than a one-cent spread across participants', () => {
		const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		for (const total of [1, 13, 101, 9999]) {
			const shares = splitEqual(total, ids, CREATED_AT);
			const values = Object.values(shares);
			expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
		}
	});
});

describe('formatCents', () => {
	it('formats whole euros', () => {
		expect(formatCents(1200)).toBe('€12.00');
	});

	it('formats cents with padding', () => {
		expect(formatCents(105)).toBe('€1.05');
	});

	it('formats negative amounts', () => {
		expect(formatCents(-500)).toBe('-€5.00');
	});

	it('formats zero', () => {
		expect(formatCents(0)).toBe('€0.00');
	});

	it('formats amounts under one euro', () => {
		expect(formatCents(5)).toBe('€0.05');
	});

	it('formats negative amounts under one euro', () => {
		expect(formatCents(-5)).toBe('-€0.05');
	});

	it('formats large amounts with thousands separators', () => {
		expect(formatCents(123456789)).toBe('€1,234,567.89');
	});

	it('formats negative zero as zero without a sign', () => {
		expect(formatCents(-0)).toBe('€0.00');
	});
});

describe('centsToInputValue', () => {
	it('converts whole euros', () => {
		expect(centsToInputValue(1200)).toBe('12.00');
	});

	it('pads single-digit cents', () => {
		expect(centsToInputValue(105)).toBe('1.05');
	});

	it('formats zero', () => {
		expect(centsToInputValue(0)).toBe('0.00');
	});

	it('formats amounts under one euro', () => {
		expect(centsToInputValue(5)).toBe('0.05');
		expect(centsToInputValue(50)).toBe('0.50');
		expect(centsToInputValue(99)).toBe('0.99');
	});

	it('formats large amounts without thousands separators', () => {
		expect(centsToInputValue(123456789)).toBe('1234567.89');
	});

	it('formats a single cent', () => {
		expect(centsToInputValue(1)).toBe('0.01');
	});
});

describe('parseEuros', () => {
	it('parses a whole euro amount', () => {
		expect(parseEuros('12')).toBe(1200);
	});

	it('parses an amount with two decimals', () => {
		expect(parseEuros('12.34')).toBe(1234);
	});

	it('parses an amount with one decimal', () => {
		expect(parseEuros('12.3')).toBe(1230);
	});

	it('accepts a comma as the decimal separator', () => {
		expect(parseEuros('12,34')).toBe(1234);
	});

	it('trims surrounding whitespace', () => {
		expect(parseEuros(' 12.34 ')).toBe(1234);
	});

	it('parses zero', () => {
		expect(parseEuros('0')).toBe(0);
		expect(parseEuros('0.00')).toBe(0);
	});

	it('parses a leading-zero decimal', () => {
		expect(parseEuros('0.05')).toBe(5);
	});

	it('rounds sub-cent floating point noise', () => {
		expect(parseEuros('19.99')).toBe(1999);
	});

	it('parses amounts with many leading digits', () => {
		expect(parseEuros('1000000.00')).toBe(100000000);
	});

	it('rejects an empty string', () => {
		expect(parseEuros('')).toBeNull();
	});

	it('rejects whitespace-only input', () => {
		expect(parseEuros('   ')).toBeNull();
	});

	it('rejects non-numeric input', () => {
		expect(parseEuros('abc')).toBeNull();
	});

	it('rejects more than two decimal places', () => {
		expect(parseEuros('12.345')).toBeNull();
	});

	it('rejects a trailing decimal point with no digits', () => {
		expect(parseEuros('12.')).toBeNull();
	});

	it('rejects a leading decimal point with no integer part', () => {
		expect(parseEuros('.5')).toBeNull();
	});

	it('rejects negative amounts', () => {
		expect(parseEuros('-5')).toBeNull();
	});

	it('rejects multiple decimal separators', () => {
		expect(parseEuros('12.3.4')).toBeNull();
		expect(parseEuros('12,3,4')).toBeNull();
	});

	it('rejects thousands separators', () => {
		expect(parseEuros('1,000')).toBeNull();
		expect(parseEuros('1,000.00')).toBeNull();
	});

	it('rejects a plain-sign or empty-after-trim string', () => {
		expect(parseEuros('+5')).toBeNull();
		expect(parseEuros('5 0')).toBeNull();
	});

	it('round-trips through centsToInputValue for a range of amounts', () => {
		for (const cents of [0, 1, 5, 50, 99, 100, 1234, 100000, 123456789]) {
			expect(parseEuros(centsToInputValue(cents))).toBe(cents);
		}
	});
});

describe('simplifyDebts', () => {
	it('returns no edges when everyone is settled', () => {
		expect(simplifyDebts({ a: 0, b: 0 })).toEqual([]);
	});

	it('returns no edges for an empty balance set', () => {
		expect(simplifyDebts({})).toEqual([]);
	});

	it('ignores a lone participant with a nonzero balance', () => {
		expect(simplifyDebts({ a: 500 })).toEqual([]);
	});

	it('produces no edges when there are no debtors despite a nonzero total', () => {
		expect(simplifyDebts({ a: 500, b: 300 })).toEqual([]);
	});

	it('settles a simple two-person debt', () => {
		expect(simplifyDebts({ a: -500, b: 500 })).toEqual([{ from: 'a', to: 'b', amountCents: 500 }]);
	});

	it('simplifies a three-person cycle into a single transaction where possible', () => {
		const edges = simplifyDebts({ a: -1000, b: 1000, c: 0 });
		expect(edges).toEqual([{ from: 'a', to: 'b', amountCents: 1000 }]);
	});

	it('reduces a net-balance set to fewer transactions than naive pairwise IOUs', () => {
		const edges = simplifyDebts({ a: 2000, b: -1000, c: -1000 });
		expect(edges).toHaveLength(2);
		expect(edges.every((e) => e.to === 'a')).toBe(true);
		expect(edges.reduce((sum, e) => sum + e.amountCents, 0)).toBe(2000);
	});

	it('every edge amount is positive and balances still net to zero after settling', () => {
		const balances = { a: 700, b: -300, c: -200, d: -200 };
		const edges = simplifyDebts(balances);
		for (const edge of edges) {
			expect(edge.amountCents).toBeGreaterThan(0);
		}

		const net: Record<string, number> = { ...balances };
		for (const edge of edges) {
			net[edge.from] += edge.amountCents;
			net[edge.to] -= edge.amountCents;
		}
		for (const amount of Object.values(net)) {
			expect(amount).toBe(0);
		}
	});

	it('is deterministic for a given input', () => {
		const balances = { a: 500, b: 300, c: -400, d: -400 };
		expect(simplifyDebts(balances)).toEqual(simplifyDebts(balances));
	});

	it('splits into independent zero-sum clusters instead of crossing between them', () => {
		const balances = { a: 600, b: 400, c: -300, d: -300, e: -400 };
		const edges = simplifyDebts(balances);
		expect(edges).toHaveLength(3);
		for (const edge of edges) {
			if (edge.from === 'e' || edge.to === 'e') {
				expect([edge.from, edge.to].sort()).toEqual(['b', 'e']);
			}
		}
	});
});
