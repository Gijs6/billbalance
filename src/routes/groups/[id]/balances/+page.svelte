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
	<p class="alert">{m.balances_closedHint()}</p>
{:else}
	<p class="page-actions">
		<Button href={resolve('/groups/[id]/settlement', { id: groupId })}>
			{m.balances_settleCta()}
		</Button>
	</p>
{/if}

<div class="table-wrap">
	<table class="table">
		<thead>
			<tr>
				<th scope="col">{m.group_tabMembers()}</th>
				<th scope="col" class="table__num">{m.balances_paidLabel()}</th>
				<th scope="col" class="table__num">{m.expense_consumedLabel()}</th>
				<th scope="col" class="table__num">{m.balances_balanceLabel()}</th>
				<th scope="col"><span class="visually-hidden">{m.balances_balanceLabel()}</span></th>
			</tr>
		</thead>
		<tbody>
			{#each data.members as member (member.id)}
				<tr>
					<th scope="row" class="row__title"
						>{member.id === data.user?.id ? m.common_you() : member.name}</th
					>
					<td class="table__num balance">{formatCents(member.paidCents, locale)}</td>
					<td class="table__num balance">{formatCents(member.consumedCents, locale)}</td>
					<td class="table__num balance {balanceLabelClass(member.balanceCents)}"
						>{formatSignedCents(member.balanceCents)}</td
					>
					<td>
						<BalanceLabel cents={member.balanceCents} isCurrentUser={member.id === data.user?.id} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
