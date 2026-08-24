import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
	const transport = getTransport();

	if (!transport) {
		console.log(`[email] Password reset link for ${email}: ${resetUrl}`);
		return;
	}

	await transport.sendMail({
		from: env.SMTP_FROM ?? env.SMTP_USER,
		to: email,
		subject: 'Reset your password',
		text: `Reset your password: ${resetUrl}`,
		html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
	});
}
