<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant,
		title,
		children
	}: {
		variant?: 'paid' | 'pending' | 'negative';
		title?: string;
		children: Snippet;
	} = $props();

	const classes = $derived(['label', variant && `label--${variant}`].filter(Boolean).join(' '));
</script>

<span class={classes} {title}>{@render children()}</span>
