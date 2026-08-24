export function safeRedirectTarget(target: string | null | undefined): string {
	if (!target) return '/';
	if (!target.startsWith('/') || target.startsWith('//')) return '/';
	return target;
}
