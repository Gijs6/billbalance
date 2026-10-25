import type { RequestEvent } from '@sveltejs/kit';
import { APP_VERSION } from '$lib/version';

type Frame = { file: string; line: number; func: string; code: string; in_app: boolean };

const FRAME = /^\s*at (?:(.+?) \()?(.+?):(\d+):\d+\)?$/;
const ROOT = process.cwd() + '/';

function framesOf(stack: string): Frame[] {
	const frames: Frame[] = [];
	for (const line of stack.split('\n').slice(1)) {
		const match = FRAME.exec(line);
		if (!match) continue;
		let file = match[2].replace(/^file:\/\//, '');
		const inApp = file.startsWith(ROOT) && !file.includes('node_modules');
		if (inApp) file = file.slice(ROOT.length);
		frames.push({
			file,
			line: Number(match[3]),
			func: match[1] ?? '<anonymous>',
			code: '',
			in_app: inApp && !file.startsWith('node:')
		});
	}
	return frames.reverse();
}

function requestFields(event: RequestEvent) {
	const forwarded = event.request.headers.get('x-forwarded-for') ?? '';
	let ip = forwarded.split(',')[0].trim();
	if (!ip) {
		try {
			ip = event.getClientAddress();
		} catch {
			ip = '';
		}
	}
	return {
		method: event.request.method,
		host: event.url.host,
		path: event.url.pathname,
		query: event.url.search.replace(/^\?/, ''),
		status: 500,
		ua: event.request.headers.get('user-agent') ?? '',
		ip,
		request_id: event.request.headers.get('x-request-id'),
		user: event.locals.user?.email ?? null
	};
}

export function report(error: unknown, kind = 'task', event?: RequestEvent) {
	const err = error instanceof Error ? error : new Error(String(error));
	const stack = err.stack ?? `${err.name}: ${err.message}`;
	const record = {
		gauge: 1,
		ts: new Date().toISOString(),
		version: APP_VERSION,
		kind,
		exc_type: err.name || 'Error',
		message: err.message,
		frames: framesOf(stack),
		traceback: stack,
		...(event ? requestFields(event) : {})
	};
	process.stderr.write(JSON.stringify(record) + '\n');
}

let registered = false;

export function registerProcessErrors() {
	if (registered) return;
	registered = true;
	process.on('uncaughtException', (error) => {
		report(error, 'crash');
		process.exit(1);
	});
	process.on('unhandledRejection', (reason) => {
		report(reason, 'crash');
		process.exit(1);
	});
}
