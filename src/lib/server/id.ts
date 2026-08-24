import { randomInt } from 'node:crypto';
import { normalizeHumanCode } from '$lib/human-code';

const BASE36_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const UNAMBIGUOUS_CHARS = '234679ABCDEFGHJKMNPRTUVWXYZ';

function randomFromAlphabet(alphabet: string, length: number): string {
	let result = '';
	for (let i = 0; i < length; i++) {
		result += alphabet[randomInt(alphabet.length)];
	}
	return result;
}

export function generateDbId(): string {
	return randomFromAlphabet(BASE36_CHARS, 8);
}

export function generateToken(): string {
	return randomFromAlphabet(BASE36_CHARS, 32);
}

export function generateHumanCode(): string {
	return normalizeHumanCode(randomFromAlphabet(UNAMBIGUOUS_CHARS, 8));
}
