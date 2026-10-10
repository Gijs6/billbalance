<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		small = false,
		href,
		type = 'button',
		onclick,
		disabled = false,
		children
	}: {
		variant?: 'default' | 'danger' | 'link';
		small?: boolean;
		href?: ResolvedPathname;
		type?: 'button' | 'submit';
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		children: Snippet;
	} = $props();

	const classes = $derived(
		variant === 'link'
			? 'link-button'
			: ['btn', variant === 'danger' && 'btn--danger', small && 'btn--sm'].filter(Boolean).join(' ')
	);
</script>

{#if href}
	<a class={classes} {href}>{@render children()}</a>
{:else}
	<button {type} class={classes} {onclick} {disabled}>{@render children()}</button>
{/if}
