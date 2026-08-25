<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		small = false,
		block = false,
		href,
		type = 'button',
		onclick,
		disabled = false,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger' | 'link';
		small?: boolean;
		block?: boolean;
		href?: ResolvedPathname;
		type?: 'button' | 'submit';
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		children: Snippet;
	} = $props();

	const classes = $derived(
		[
			'button',
			variant !== 'primary' && `button--${variant}`,
			small && 'button--small',
			block && 'button--block'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={classes} {href}>{@render children()}</a>
{:else}
	<button {type} class={classes} {onclick} {disabled}>{@render children()}</button>
{/if}
