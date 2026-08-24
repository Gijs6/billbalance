<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);

	function balanceLabelClass(cents: number): string {
		if (cents > 0) return 'balance-label balance-label--positive';
		if (cents < 0) return 'balance-label balance-label--negative';
		return 'balance-label balance-label--zero';
	}

	function formatSignedCents(cents: number): string {
		return cents > 0 ? `+${formatCents(cents)}` : formatCents(cents);
	}
</script>

<PageTitle title="Balances" />

{#if data.isClosed}
	<p class="form__hint">
		This is the final balance from when the group closed. See the Settlement tab for what's still
		owed.
	</p>
{:else}
	<p class="form__actions">
		<a class="button" href={resolve('/groups/[id]/settlement', { id: groupId })}
			>Settle group balance</a
		>
	</p>
{/if}

<ul class="list">
	{#each data.members as member (member.id)}
		<li>
			<details class="balance-card">
				<summary class="list-item">
					<span class="list-item__title">{member.name}</span>
					<span class={balanceLabelClass(member.balanceCents)}>
						{#if member.balanceCents > 0}
							is owed <span class="balance">{formatCents(member.balanceCents)}</span>
						{:else if member.balanceCents < 0}
							owes <span class="balance">{formatCents(-member.balanceCents)}</span>
						{:else}
							settled up
						{/if}
					</span>
				</summary>
				<div class="balance-equation">
					<div class="balance-equation__grid">
						<span class="balance-equation__label balance-equation__label--paid">Paid</span>
						<span class="balance-equation__label balance-equation__label--consumed">Consumed</span>
						<span class="balance-equation__label balance-equation__label--balance">Balance</span>

						<span class="balance balance-equation__value--paid"
							>{formatCents(member.paidCents)}</span
						>
						<span
							class="balance-equation__operator balance-equation__operator--minus"
							aria-hidden="true">-</span
						>
						<span class="balance balance-equation__value--consumed"
							>{formatCents(member.consumedCents)}</span
						>
						<span
							class="balance-equation__operator balance-equation__operator--equals"
							aria-hidden="true">=</span
						>
						<span
							class="balance balance-equation__value--balance {balanceLabelClass(
								member.balanceCents
							)}">{formatSignedCents(member.balanceCents)}</span
						>
					</div>
				</div>
			</details>
		</li>
	{/each}
</ul>
