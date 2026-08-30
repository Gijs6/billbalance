<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BalanceLabel, { balanceLabelClass } from '$lib/components/BalanceLabel.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);
	const locale = getLocale();

	function formatSignedCents(cents: number): string {
		return cents > 0 ? `+${formatCents(cents, locale)}` : formatCents(cents, locale);
	}
</script>

<PageTitle title={m.group_tabBalances()} />

{#if data.isClosed}
	<p class="form__hint">
		{m.balances_closedHint()}
	</p>
{:else}
	<p class="form__actions">
		<Button href={resolve('/groups/[id]/settlement', { id: groupId })}>
			{m.balances_settleCta()}
		</Button>
	</p>
{/if}

<ul class="list">
	{#each data.members as member (member.id)}
		<li>
			<details class="balance-card">
				<summary class="list-item">
					<span class="list-item__title"
						>{member.id === data.user?.id ? m.common_you() : member.name}</span
					>
					<BalanceLabel cents={member.balanceCents} isCurrentUser={member.id === data.user?.id} />
				</summary>
				<div class="balance-equation">
					<div class="balance-equation__grid">
						<span class="balance-equation__label balance-equation__label--paid"
							>{m.balances_paidLabel()}</span
						>
						<span class="balance-equation__label balance-equation__label--consumed"
							>{m.expense_consumedLabel()}</span
						>
						<span class="balance-equation__label balance-equation__label--balance"
							>{m.balances_balanceLabel()}</span
						>

						<span class="balance balance-equation__value--paid"
							>{formatCents(member.paidCents, locale)}</span
						>
						<span
							class="balance-equation__operator balance-equation__operator--minus"
							aria-hidden="true">-</span
						>
						<span class="balance balance-equation__value--consumed"
							>{formatCents(member.consumedCents, locale)}</span
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
