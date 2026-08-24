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

const SENDER_NAME = 'billbalance';

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
	const transport = getTransport();

	if (!transport) {
		console.log(`[email] Password reset link for ${email}: ${resetUrl}`);
		return;
	}

	const senderAddress = env.SMTP_FROM ?? env.SMTP_USER;

	await transport.sendMail({
		from: senderAddress ? `${SENDER_NAME} <${senderAddress}>` : undefined,
		to: email,
		subject: 'Reset your password - billbalance',
		text: `Hey,\n\nYou can reset your password using the link below:\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nbillbalance`,
		html: `<p>Hey,</p><p>You can reset your password using the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p><p>billbalance</p>`
	});
}
