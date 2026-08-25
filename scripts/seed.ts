import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../src/lib/server/db/schema';
import { generateDbId } from '../src/lib/server/id';
import { splitEqual } from '../src/lib/money';

const DEFAULT_SIZE = 5;
const EXPENSES_PER_USER = 5;

const EXPENSE_DESCRIPTIONS = [
	'Groceries',
	'Dinner',
	'Taxi',
	'Hotel',
	'Drinks',
	'Coffee',
	'Movie tickets',
	'Gas',
	'Snacks',
	'Museum entry',
	'Breakfast',
	'Lunch',
	'Pizza',
	'Beers',
	'Parking'
];

const FIRST_NAMES = [
	'Alex',
	'Chloe',
	'Emma',
	'Finn',
	'Hana',
	'Iris',
	'Jasper',
	'Kayla',
	'Liam',
	'Mila',
	'Noah',
	'Olga',
	'Quinn',
	'Ravi',
	'Tobias',
	'Uma',
	'Vera',
	'Xander',
	'Yara',
	'Zoe',
	'Oliver',
	'Amelia',
	'George',
	'Charlotte',
	'Harry',
	'Isabella',
	'Jack',
	'Freya',
	'Archie',
	'Poppy',
	'Oscar',
	'Ivy',
	'Arthur',
	'Florence',
	'Edward',
	'Alice',
	'Henry',
	'Beatrice',
	'Nigel',
	'Rosie',
	'Charlie',
	'Millie'
];

const GROUP_NAMES = [
	'Ski Trip',
	'Roommates',
	'Weekend in Berlin',
	'Office Lunches',
	'Camping Trip',
	'Bachelor Party',
	'Beach House',
	'Road Trip',
	'Festival Squad',
	'Poker Night'
];

function openDb() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error('DATABASE_URL is not set');

	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema });
	return { client, db };
}

function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(items: T[]): T {
	return items[randomInt(0, items.length - 1)];
}

function shuffledNames(count: number): string[] {
	const shuffled = [...FIRST_NAMES].sort(() => Math.random() - 0.5);
	const names: string[] = [];
	for (let i = 0; i < count; i++) {
		const cycle = Math.floor(i / shuffled.length);
		const base = shuffled[i % shuffled.length];
		names.push(cycle === 0 ? base : `${base} ${cycle + 1}`);
	}
	return names;
}

function randomMemberCount(maxMembers: number): number {
	let count = 2;
	while (count < maxMembers && Math.random() < 0.5) {
		count++;
	}
	return count;
}

function splitRandom(totalCents: number, ids: string[]): Record<string, number> {
	if (ids.length === 0) return {};
	if (ids.length === 1) return { [ids[0]]: totalCents };

	const weights = ids.map(() => Math.random() + 0.1);
	const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
	const shares = ids.map((id, i) => ({ id, raw: (totalCents * weights[i]) / weightSum }));

	const result: Record<string, number> = {};
	let allocated = 0;
	for (const { id, raw } of shares) {
		const cents = Math.floor(raw);
		result[id] = cents;
		allocated += cents;
	}

	let remainder = totalCents - allocated;
	const byFractionDesc = [...shares].sort((a, b) => (b.raw % 1) - (a.raw % 1));
	for (const { id } of byFractionDesc) {
		if (remainder <= 0) break;
		result[id]++;
		remainder--;
	}

	return result;
}

function printProgress(label: string, current: number, total: number) {
	process.stdout.write(`\r${label}: ${current}/${total}`);
	if (current === total) process.stdout.write('\n');
}

function parseSize(): number {
	const arg = process.argv[2];
	if (arg === undefined) return DEFAULT_SIZE;

	const size = Number(arg);
	if (!Number.isInteger(size) || size < 1) {
		throw new Error(`Invalid size "${arg}", expected a positive integer`);
	}
	return size;
}

const { client, db } = openDb();
const { user, group, groupMember, expense, expenseConsumption } = schema;

const auth = betterAuth({
	baseURL: process.env.ORIGIN,
	database: drizzleAdapter(db, { provider: 'sqlite', schema }),
	advanced: { database: { generateId: () => generateDbId() } },
	emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 255 }
});

async function seed() {
	const userCount = parseSize();
	const expenseCount = userCount * EXPENSES_PER_USER;
	const emailPrefix = `seed${userCount}`;
	const names = shuffledNames(userCount);
	const userIds: string[] = [];

	for (let i = 1; i <= userCount; i++) {
		const suffix = String(i).padStart(2, '0');
		const email = `${emailPrefix}_${suffix}@test.com`;
		const [existing] = await db.select().from(user).where(eq(user.email, email));
		if (existing) {
			userIds.push(existing.id);
			printProgress('Users', i, userCount);
			continue;
		}

		const { user: created } = await auth.api.signUpEmail({
			body: { name: `${names[i - 1]} (${emailPrefix}_${suffix})`, email, password: 'testtest' }
		});
		userIds.push(created.id);
		printProgress('Users', i, userCount);
	}

	const [newGroup] = await db
		.insert(group)
		.values({ name: pick(GROUP_NAMES), createdByUser: userIds[0] })
		.returning();

	await db.insert(groupMember).values(userIds.map((userId) => ({ groupId: newGroup.id, userId })));

	for (let i = 0; i < expenseCount; i++) {
		const paidByUser = pick(userIds);
		const memberCount = randomMemberCount(userIds.length);
		const consumingMembers = [...userIds].sort(() => Math.random() - 0.5).slice(0, memberCount);
		const amountCents = randomInt(300, 12000);

		const [newExpense] = await db
			.insert(expense)
			.values({
				groupId: newGroup.id,
				description: pick(EXPENSE_DESCRIPTIONS),
				amountCents,
				paidByUser,
				createdByUser: paidByUser
			})
			.returning();

		const shares =
			Math.random() < 0.5
				? splitEqual(amountCents, consumingMembers, newExpense.createdAt.getTime())
				: splitRandom(amountCents, consumingMembers);
		await db.insert(expenseConsumption).values(
			Object.entries(shares).map(([userId, shareCents]) => ({
				expenseId: newExpense.id,
				userId,
				amountCents: shareCents
			}))
		);
		printProgress('Expenses', i + 1, expenseCount);
	}

	console.log(
		`Seeded ${emailPrefix}_01@test.com … ${emailPrefix}_${String(userCount).padStart(2, '0')}@test.com (password "testtest")`
	);
	console.log(`Group: "${newGroup.name}" (${newGroup.id}) with ${expenseCount} expenses`);
}

seed()
	.then(() => client.close())
	.catch((err) => {
		client.close();
		throw err;
	});
