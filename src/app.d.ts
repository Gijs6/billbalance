import type { User } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: { id: string; userId: string; expiresAt: Date } | null;
		}
	}
}

export {};
