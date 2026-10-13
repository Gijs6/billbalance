<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCents } from '$lib/money';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SettlementEdgeStatus from '$lib/components/SettlementEdgeStatus.svelte';
	import SettlementGroup from '$lib/components/SettlementGroup.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const currentUserId = $derived(data.user?.id);
	const locale = getLocale();
</script>

<PageTitle title={data.isClosed ? m.group_tabSettlement() : m.settlement_previewTitle()} />

{#if !data.isClosed}
	<section class="panel">
		<h2 class="panel__heading">
			{m.settlement_previewTitle()}
			<form
				method="POST"
				action="?/confirm"
				data-confirm={`${m.settlement_confirmHeading({ name: data.group.name })} ${m.settlement_confirmWarning({ name: data.group.name })}`}
				data-confirm-action={m.settlement_confirmCta()}
				use:enhance
			>
				<Button type="submit" small>{m.balances_settleCta()}</Button>
			</form>
		</h2>

		{#if data.edges.length > 0}
			<p>{m.settlement_previewIntro()}</p>
			<p class="settlement__summary">
				{#if data.edges.length === 1}
					{m.settlement_previewSummarySingular({
						count: data.edges.length,
						amount: formatCents(
							data.edges.reduce((sum, edge) => sum + edge.amountCents, 0),
							locale
						)
					})}
				{:else}
					{m.settlement_previewSummaryPlural({
						count: data.edges.length,
						amount: formatCents(
							data.edges.reduce((sum, edge) => sum + edge.amountCents, 0),
							locale
						)
					})}
				{/if}
			</p>
		{:else}
			<div class="empty"><p class="empty__title">{m.settlement_emptyPreview()}</p></div>
		{/if}
	</section>
{:else if data.settlements.length === 0}
	<div class="empty"><p class="empty__title">{m.settlement_emptyClosed()}</p></div>
{:else if data.myReceivables.length > 0 || data.myPayables.length > 0}
	<section class="panel" aria-labelledby="your-overview-heading">
		<h2 id="your-overview-heading" class="panel__heading">{m.settlement_yourOverviewHeading()}</h2>
		<div class="table-wrap">
			<table class="table">
				{#if data.myReceivables.length > 0}
					<tbody>
						<tr class="table__group">
							<th scope="colgroup" colspan="3">{m.settlement_toReceiveHeading()}</th>
						</tr>
						{#each data.myReceivables as edge (edge.id)}
							<tr>
								<td>{m.settlement_owesYou({ name: edge.fromName })}</td>
								<SettlementEdgeStatus {edge} {currentUserId} />
							</tr>
						{/each}
					</tbody>
				{/if}
				{#if data.myPayables.length > 0}
					<tbody>
						<tr class="table__group">
							<th scope="colgroup" colspan="3">{m.settlement_toPayHeading()}</th>
						</tr>
						{#each data.myPayables as edge (edge.id)}
							<tr>
								<td>{m.settlement_youOwe({ name: edge.toName })}</td>
								<SettlementEdgeStatus {edge} {currentUserId} />
							</tr>
						{/each}
					</tbody>
				{/if}
			</table>
		</div>
	</section>
{/if}

{#if data.creditors.length > 0}
	<section class="panel" aria-labelledby="owed-heading">
		<h2 id="owed-heading" class="panel__heading">{m.settlement_owedHeading()}</h2>
		<div class="table-wrap">
			<table class="table">
				{#each data.creditors as person (person.id)}
					<SettlementGroup
						{person}
						direction="creditor"
						{currentUserId}
						showStatus={data.isClosed}
					/>
				{/each}
			</table>
		</div>
	</section>
{/if}

{#if data.debtors.length > 0}
	<section class="panel" aria-labelledby="owes-heading">
		<h2 id="owes-heading" class="panel__heading">{m.settlement_owesHeading()}</h2>
		<div class="table-wrap">
			<table class="table">
				{#each data.debtors as person (person.id)}
					<SettlementGroup {person} direction="debtor" {currentUserId} showStatus={data.isClosed} />
				{/each}
			</table>
		</div>
	</section>
{/if}
