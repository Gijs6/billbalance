import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { generateDbId } from '$lib/server/id';
import { sendPasswordResetEmail } from '$lib/server/email';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	database: drizzleAdapter(db, { provider: 'sqlite', schema }),
	advanced: {
		database: { generateId: () => generateDbId() }
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24 * 15
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 255,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, token }, request) => {
			const origin = request ? new URL(request.url).origin : env.ORIGIN;
			await sendPasswordResetEmail(user.email, `${origin}/reset-password/${token}`);
		}
	},
	user: {
		deleteUser: { enabled: true }
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
