import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/password';
import { splitEqual } from '../src/lib/money';
import { openDb, randomInt, pick, EXPENSE_DESCRIPTIONS } from './seed-lib';

const { client, db } = openDb();
const { user, group, groupMember, expense, expenseSplit } = schema;

const USER_COUNT = 50;
const EXPENSE_COUNT = 250;

async function seed() {
	const userIds: string[] = [];

	for (let i = 1; i <= USER_COUNT; i++) {
		const suffix = String(i).padStart(2, '0');
		const email = `big_${suffix}@test.com`;
		const [existing] = await db.select().from(user).where(eq(user.email, email));
		if (existing) {
			userIds.push(existing.id);
			continue;
		}

		const passwordHash = await hashPassword('testtest');
		const [created] = await db
			.insert(user)
			.values({ name: `Big User ${suffix}`, email, passwordHash })
			.returning();
		userIds.push(created.id);
	}

	const [newGroup] = await db
		.insert(group)
		.values({ name: 'Big Group', createdBy: userIds[0] })
		.returning();

	await db.insert(groupMember).values(userIds.map((userId) => ({ groupId: newGroup.id, userId })));

	for (let i = 0; i < EXPENSE_COUNT; i++) {
		const paidBy = pick(userIds);
		const participantCount = randomInt(2, userIds.length);
		const participants = [...userIds].sort(() => Math.random() - 0.5).slice(0, participantCount);
		const amountCents = randomInt(500, 8000);

		const [newExpense] = await db
			.insert(expense)
			.values({
				groupId: newGroup.id,
				description: pick(EXPENSE_DESCRIPTIONS),
				amountCents,
				paidBy,
				createdBy: paidBy
			})
			.returning();

		const shares = splitEqual(amountCents, participants);
		await db.insert(expenseSplit).values(
			Object.entries(shares).map(([userId, shareCents]) => ({
				expenseId: newExpense.id,
				userId,
				amountCents: shareCents
			}))
		);
	}

	console.log(`Seeded big_01@test.com … big_50@test.com (password "testtest")`);
	console.log(`Group: "${newGroup.name}" (${newGroup.id}) with ${EXPENSE_COUNT} expenses`);
}

seed()
	.then(() => client.close())
	.catch((err) => {
		client.close();
		throw err;
	});
