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

	const tones = { paid: 'status--ok', pending: 'status--warn', negative: 'status--bad' };
	const classes = $derived(['status', variant && tones[variant]].filter(Boolean).join(' '));
</script>

<span class={classes} {title}>{@render children()}</span>
