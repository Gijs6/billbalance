import { relations, sql } from 'drizzle-orm';
import {
	sqliteTable,
	text,
	integer,
	primaryKey,
	index,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';
import { generateDbId, generateHumanCode } from '$lib/server/id';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	locale: text('locale', { enum: ['en-US', 'en-GB', 'nl'] })
		.notNull()
		.default('en-US'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$onUpdate(() => new Date()),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		issuer: text('issuer').notNull(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
		scope: text('scope'),
		password: text('password'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$onUpdate(() => new Date())
	},
	(table) => [
		uniqueIndex('account_issuer_accountId_uidx').on(table.issuer, table.accountId),
		index('account_userId_idx').on(table.userId)
	]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] })
}));

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;

export const group = sqliteTable('group', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateDbId()),
	name: text('name').notNull(),
	joinCode: text('join_code')
		.notNull()
		.unique()
		.$defaultFn(() => generateHumanCode()),
	createdByUser: text('created_by_user')
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
	paidByUser: text('paid_by_user')
		.notNull()
		.references(() => user.id),
	createdByUser: text('created_by_user')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const expenseConsumption = sqliteTable(
	'expense_consumption',
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
export type ExpenseConsumption = typeof expenseConsumption.$inferSelect;
export type Settlement = typeof settlement.$inferSelect;
