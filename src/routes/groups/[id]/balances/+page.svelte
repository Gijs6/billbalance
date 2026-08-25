<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BalanceLabel, { balanceLabelClass } from '$lib/components/BalanceLabel.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);

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
		<Button href={resolve('/groups/[id]/settlement', { id: groupId })}>Settle group balance</Button>
	</p>
{/if}

<ul class="list">
	{#each data.members as member (member.id)}
		<li>
			<details class="balance-card">
				<summary class="list-item">
					<span class="list-item__title">{member.id === data.user?.id ? 'You' : member.name}</span>
					<BalanceLabel cents={member.balanceCents} isCurrentUser={member.id === data.user?.id} />
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
