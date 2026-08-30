import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { isLocale, type Locale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';

function getTransport() {
	if (!env.SMTP_HOST) return null;

	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT ?? 587),
		secure: env.SMTP_SECURE === 'true',
		auth: env.SMTP_USER
			? {
					user: env.SMTP_USER,
					pass: env.SMTP_PASS
				}
			: undefined
	});
}

const SENDER_NAME = 'billbalance';

export async function sendPasswordResetEmail(email: string, resetUrl: string, userLocale?: string) {
	const transport = getTransport();
	const locale = isLocale(userLocale) ? userLocale : undefined;
	const opts: { locale?: Locale } = locale ? { locale } : {};

	if (!transport) {
		console.log(`[email] Password reset link for ${email}: ${resetUrl}`);
		return;
	}

	const senderAddress = env.SMTP_FROM ?? env.SMTP_USER;

	await transport.sendMail({
		from: senderAddress ? `${SENDER_NAME} <${senderAddress}>` : undefined,
		to: email,
		subject: `${m.email_resetSubject({}, opts)} - ${SENDER_NAME}`,
		text: `${m.email_resetGreeting({}, opts)}\n\n${m.email_resetIntro({}, opts)}\n${resetUrl}\n\n${m.email_resetIgnore({}, opts)}\n\n${SENDER_NAME}`,
		html: `<p>${m.email_resetGreeting({}, opts)}</p><p>${m.email_resetIntro({}, opts)}</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>${m.email_resetIgnore({}, opts)}</p><p>${SENDER_NAME}</p>`
	});
}
