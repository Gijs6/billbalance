import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const DEV_EMAIL = 'dev@test.com';
export const DEV_SIGNED_OUT_COOKIE = 'dev_signed_out';
const DEV_PASSWORD = 'testtest';

export async function signInDevUser(headers: Headers): Promise<void> {
	const existing = db.select({ id: user.id }).from(user).where(eq(user.email, DEV_EMAIL)).get();
	if (!existing) {
		await auth.api.signUpEmail({
			body: { name: 'dev', email: DEV_EMAIL, password: DEV_PASSWORD, locale: 'en-US' }
		});
	}
	await auth.api.signInEmail({ body: { email: DEV_EMAIL, password: DEV_PASSWORD }, headers });
}
