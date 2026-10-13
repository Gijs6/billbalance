<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	let {
		action = '?/delete',
		label,
		question,
		hint
	}: {
		action?: string;
		label: string;
		question: string;
		hint?: Snippet;
	} = $props();
</script>

{#if hint}
	<p>{@render hint()}</p>
{/if}
<form method="POST" {action} data-confirm={question} use:enhance>
	<input type="hidden" name="confirm" value="true" />
	<Button type="submit" variant="danger">{label}</Button>
</form>
