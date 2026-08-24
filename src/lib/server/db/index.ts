import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let instance: Db | undefined;

function getInstance(): Db {
	if (!instance) {
		if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
		instance = drizzle(new Database(env.DATABASE_URL), { schema });
	}
	return instance;
}

export const db: Db = new Proxy({} as Db, {
	get(_target, prop) {
		const real = getInstance();
		const value = Reflect.get(real, prop);
		return typeof value === 'function' ? value.bind(real) : value;
	}
});
