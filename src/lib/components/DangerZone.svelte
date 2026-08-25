<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ResolvedPathname } from '$app/types';
	import type { Snippet } from 'svelte';

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

<div class="danger-zone">
	{#if needsConfirm}
		<p class="form__error" role="alert">{@render confirmMessage()}</p>
		<form method="POST" {action} class="form__actions" use:enhance>
			<input type="hidden" name="confirm" value="true" />
			<button type="submit" class="button button--danger">{confirmLabel}</button>
			<a class="button button--secondary" href={cancelHref}>Cancel</a>
		</form>
	{:else}
		{#if hint}
			<p class="form__hint">{@render hint()}</p>
		{/if}
		<form method="POST" {action} use:enhance>
			<button type="submit" class="button button--danger">{deleteLabel}</button>
		</form>
	{/if}
</div>
