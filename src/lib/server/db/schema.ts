import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { generateDbId, generateHumanCode } from '$lib/server/id';

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateDbId()),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const passwordResetToken = sqliteTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type User = typeof user.$inferSelect;

export const group = sqliteTable('group', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateDbId()),
	name: text('name').notNull(),
	joinCode: text('join_code')
		.notNull()
		.unique()
		.$defaultFn(() => generateHumanCode()),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id),
	status: text('status', { enum: ['open', 'closed'] })
		.notNull()
		.default('open'),
	closedAt: integer('closed_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const groupMember = sqliteTable(
	'group_member',
	{
		groupId: text('group_id')
			.notNull()
			.references(() => group.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		joinedAt: integer('joined_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

export const expense = sqliteTable('expense', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateDbId()),
	groupId: text('group_id')
		.notNull()
		.references(() => group.id, { onDelete: 'cascade' }),
	description: text('description').notNull(),
	amountCents: integer('amount_cents').notNull(),
	paidBy: text('paid_by')
		.notNull()
		.references(() => user.id),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const expenseSplit = sqliteTable(
	'expense_split',
	{
		expenseId: text('expense_id')
			.notNull()
			.references(() => expense.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		amountCents: integer('amount_cents').notNull()
	},
	(table) => [primaryKey({ columns: [table.expenseId, table.userId] })]
);

export const settlement = sqliteTable('settlement', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateDbId()),
	groupId: text('group_id')
		.notNull()
		.references(() => group.id, { onDelete: 'cascade' }),
	fromUser: text('from_user')
		.notNull()
		.references(() => user.id),
	toUser: text('to_user')
		.notNull()
		.references(() => user.id),
	amountCents: integer('amount_cents').notNull(),
	status: text('status', { enum: ['pending', 'paid'] })
		.notNull()
		.default('pending'),
	paidAt: integer('paid_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export type Group = typeof group.$inferSelect;
export type GroupMember = typeof groupMember.$inferSelect;
export type Expense = typeof expense.$inferSelect;
export type ExpenseSplit = typeof expenseSplit.$inferSelect;
export type Settlement = typeof settlement.$inferSelect;
