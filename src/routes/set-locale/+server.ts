import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { isLocale, cookieName, cookieMaxAge } from '$lib/paraglide/runtime';
import { safeRedirectTarget } from '$lib/server/safe-redirect';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const locale = form.get('locale');

	if (isLocale(locale)) {
		cookies.set(cookieName, locale, {
			path: '/',
			maxAge: cookieMaxAge,
			httpOnly: false,
			secure: !dev
		});
	}

	redirect(303, safeRedirectTarget(form.get('redirectTo')?.toString()));
};
