import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { passwordResetToken } from '$lib/server/db/schema';
import { generateToken } from '$lib/server/id';

const RESET_TOKEN_DURATION_MS = 1000 * 60 * 60;

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(userId: string): Promise<string> {
	await db.delete(passwordResetToken).where(eq(passwordResetToken.userId, userId));

	const token = generateToken();
	const id = hashToken(token);
	const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);
	await db.insert(passwordResetToken).values({ id, userId, expiresAt });
	return token;
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
	const id = hashToken(token);
	const [row] = await db.select().from(passwordResetToken).where(eq(passwordResetToken.id, id));

	if (!row) return null;
	if (Date.now() >= row.expiresAt.getTime()) {
		await db.delete(passwordResetToken).where(eq(passwordResetToken.id, id));
		return null;
	}
	return row.userId;
}

export async function consumePasswordResetToken(token: string) {
	await db.delete(passwordResetToken).where(eq(passwordResetToken.id, hashToken(token)));
}
