import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema';

export function openDb() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error('DATABASE_URL is not set');

	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema });
	return { client, db };
}

export function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

export function pick<T>(items: T[]): T {
	return items[randomInt(0, items.length - 1)];
}

export const EXPENSE_DESCRIPTIONS = [
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
