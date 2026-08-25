import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { getLocale, cookieName, cookieMaxAge, isLocale } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

function withLocaleCookie(request: Request, locale: string): Request {
	const cookieHeader = request.headers.get('cookie') ?? '';
	const withoutLocale = cookieHeader
		.split(';')
		.map((part) => part.trim())
		.filter((part) => part && !part.startsWith(`${cookieName}=`))
		.join('; ');
	const headers = new Headers(request.headers);
	headers.set('cookie', [withoutLocale, `${cookieName}=${locale}`].filter(Boolean).join('; '));
	return new Request(request.clone(), { headers });
}

export const handle: Handle = async ({ event, resolve }) => {
	const result = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = result?.user ?? null;
	event.locals.session = result?.session ?? null;

	let request = event.request;
	if (event.locals.user && isLocale(event.locals.user.locale)) {
		const dbLocale = event.locals.user.locale;
		if (event.cookies.get(cookieName) !== dbLocale) {
			event.cookies.set(cookieName, dbLocale, {
				path: '/',
				maxAge: cookieMaxAge,
				httpOnly: false
			});
		}
		request = withLocaleCookie(event.request, dbLocale);
	}

	return paraglideMiddleware(request, ({ request: localizedRequest }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', getLocale())
		});
	});
};
