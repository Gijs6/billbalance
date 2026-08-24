import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/password';
import { splitEqual } from '../src/lib/money';
import { openDb, randomInt, pick, EXPENSE_DESCRIPTIONS } from './seed-lib';

const { client, db } = openDb();
const { user, group, groupMember, expense, expenseSplit } = schema;

const DUMMY_LETTERS = ['a', 'b', 'c', 'd', 'e'];
const EXPENSE_COUNT = 15;

async function seed() {
	const userIds: string[] = [];

	for (const letter of DUMMY_LETTERS) {
		const email = `dummy_${letter}@test.com`;
		const [existing] = await db.select().from(user).where(eq(user.email, email));
		if (existing) {
			userIds.push(existing.id);
			continue;
		}

		const passwordHash = await hashPassword('testtest');
		const [created] = await db
			.insert(user)
			.values({ name: `Dummy ${letter.toUpperCase()}`, email, passwordHash })
			.returning();
		userIds.push(created.id);
	}

	const [newGroup] = await db
		.insert(group)
		.values({ name: 'Dummy Group', createdBy: userIds[0] })
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

	console.log(`Seeded dummy_a@test.com … dummy_e@test.com (password "testtest")`);
	console.log(`Group: "${newGroup.name}" (${newGroup.id}) with ${EXPENSE_COUNT} expenses`);
}

seed()
	.then(() => client.close())
	.catch((err) => {
		client.close();
		throw err;
	});
