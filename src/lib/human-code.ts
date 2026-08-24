const GROUP_SIZE = 4;
const CODE_LENGTH = GROUP_SIZE * 2;

export function normalizeHumanCode(raw: string): string {
	const chars = raw
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.slice(0, CODE_LENGTH);

	if (chars.length <= GROUP_SIZE) return chars;
	return `${chars.slice(0, GROUP_SIZE)}-${chars.slice(GROUP_SIZE)}`;
}

export function formatHumanCodeInput(raw: string): string {
	return raw
		.toUpperCase()
		.replace(/[^A-Z0-9-]/g, '')
		.slice(0, CODE_LENGTH + 1);
}
