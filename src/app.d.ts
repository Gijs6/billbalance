import type { auth } from '$lib/server/auth';

type Session = typeof auth.$Infer.Session;

declare global {
	interface Window {
		toast: (
			message: string,
			opts?: { type?: 'info' | 'success' | 'warning' | 'danger' }
		) => HTMLElement;
	}

	namespace App {
		interface Locals {
			user: Session['user'] | null;
			session: Session['session'] | null;
		}
	}
}

export {};
