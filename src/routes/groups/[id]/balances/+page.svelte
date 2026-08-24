<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);

	function balanceClass(cents: number): string {
		if (cents > 0) return 'balance balance--positive';
		if (cents < 0) return 'balance balance--negative';
		return 'balance balance--zero';
	}

	function balanceLabel(cents: number): string {
		if (cents > 0) return `is owed ${formatCents(cents)}`;
		if (cents < 0) return `owes ${formatCents(-cents)}`;
		return 'settled up';
	}
</script>

<PageTitle title="Balances" />

{#if data.isClosed}
	<p class="form__hint">
		This is the final balance from when the group closed. See the Settlement tab for what's still
		owed.
	</p>
{/if}

<ul class="list">
	{#each data.members as member (member.id)}
		<li class="list-item">
			<span class="list-item__title">{member.name}</span>
			<span class={balanceClass(member.balanceCents)}>{balanceLabel(member.balanceCents)}</span>
		</li>
	{/each}
</ul>

{#if !data.isClosed}
	<p class="form__actions" style="margin-top: 0.75rem;">
		<a class="button button--secondary" href={resolve('/groups/[id]/settle', { id: groupId })}
			>Settle group balance</a
		>
	</p>
{/if}
