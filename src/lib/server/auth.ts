import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session, user, type User } from '$lib/server/db/schema';
import { generateToken } from '$lib/server/id';

export { hashPassword, verifyPassword } from '$lib/server/password';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_RENEW_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15;

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string) {
	const token = generateToken();
	const id = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await db.insert(session).values({ id, userId, expiresAt });
	return { token, expiresAt };
}

export async function validateSessionToken(
	token: string
): Promise<{ session: typeof session.$inferSelect; user: User } | { session: null; user: null }> {
	const id = hashToken(token);
	const result = await db
		.select({ session, user })
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(session.id, id));

	if (result.length === 0) return { session: null, user: null };
	const { session: currentSession, user: currentUser } = result[0];

	if (Date.now() >= currentSession.expiresAt.getTime()) {
		await db.delete(session).where(eq(session.id, id));
		return { session: null, user: null };
	}

	if (Date.now() >= currentSession.expiresAt.getTime() - SESSION_RENEW_THRESHOLD_MS) {
		currentSession.expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
		await db.update(session).set({ expiresAt: currentSession.expiresAt }).where(eq(session.id, id));
	}

	return { session: currentSession, user: currentUser };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(session).where(eq(session.id, sessionId));
}

export async function invalidateAllSessionsForUser(userId: string) {
	await db.delete(session).where(eq(session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.env.DEV,
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function getSessionToken(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE);
}
