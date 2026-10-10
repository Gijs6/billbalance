<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ResolvedPathname } from '$app/types';
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import Button from './Button.svelte';

	let {
		action = '?/delete',
		needsConfirm,
		confirmLabel,
		cancelHref,
		deleteLabel,
		hint,
		confirmMessage
	}: {
		action?: string;
		needsConfirm: boolean;
		confirmLabel: string;
		cancelHref: ResolvedPathname;
		deleteLabel: string;
		hint?: Snippet;
		confirmMessage: Snippet;
	} = $props();
</script>

{#if needsConfirm}
	<p class="alert alert--danger" role="alert">{@render confirmMessage()}</p>
	<form method="POST" {action} class="form__actions" use:enhance>
		<input type="hidden" name="confirm" value="true" />
		<Button type="submit" variant="danger">{confirmLabel}</Button>
		<Button href={cancelHref}>{m.common_cancel()}</Button>
	</form>
{:else}
	{#if hint}
		<p>{@render hint()}</p>
	{/if}
	<form method="POST" {action} use:enhance>
		<Button type="submit" variant="danger">{deleteLabel}</Button>
	</form>
{/if}
