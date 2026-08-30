<script module lang="ts">
	export function balanceLabelClass(cents: number): string {
		if (cents > 0) return 'balance-label balance-label--positive';
		if (cents < 0) return 'balance-label balance-label--negative';
		return 'balance-label balance-label--zero';
	}
</script>

<script lang="ts">
	import { formatCents } from '$lib/money';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { Snippet } from 'svelte';

	let {
		cents,
		isCurrentUser = false,
		positive,
		negative,
		zero
	}: {
		cents: number;
		isCurrentUser?: boolean;
		positive?: Snippet;
		negative?: Snippet;
		zero?: Snippet;
	} = $props();

	const locale = getLocale();
</script>

<span class={balanceLabelClass(cents)}>
	{#if cents > 0}
		{#if positive}
			{@render positive()}
		{:else}
			{isCurrentUser ? m.balance_areOwed() : m.balance_isOwed()}
			<span class="balance">{formatCents(cents, locale)}</span>
		{/if}
	{:else if cents < 0}
		{#if negative}
			{@render negative()}
		{:else}
			{isCurrentUser ? m.balance_owe() : m.balance_owes()}
			<span class="balance">{formatCents(-cents, locale)}</span>
		{/if}
	{:else if zero}
		{@render zero()}
	{:else}
		{m.balance_settledUp()}
	{/if}
</span>
