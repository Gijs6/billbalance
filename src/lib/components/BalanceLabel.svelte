<script module lang="ts">
	export function balanceLabelClass(cents: number): string {
		if (cents > 0) return 'balance-label balance-label--positive';
		if (cents < 0) return 'balance-label balance-label--negative';
		return 'balance-label balance-label--zero';
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		cents,
		positive,
		negative,
		zero
	}: {
		cents: number;
		positive: Snippet;
		negative: Snippet;
		zero: Snippet;
	} = $props();
</script>

<span class={balanceLabelClass(cents)}>
	{#if cents > 0}
		{@render positive()}
	{:else if cents < 0}
		{@render negative()}
	{:else}
		{@render zero()}
	{/if}
</span>
