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

	let confirmDialog: HTMLDialogElement | undefined = $state();
</script>

<PageTitle title={data.isClosed ? m.group_tabSettlement() : m.settlement_previewTitle()} />

{#if !data.isClosed}
	<section class="panel">
		<h2 class="panel__heading">
			{m.settlement_previewTitle()}
			<Button type="button" small onclick={() => confirmDialog?.showModal()}>
				{m.balances_settleCta()}
			</Button>
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
			<div class="empty"><p>{m.settlement_emptyPreview()}</p></div>
		{/if}
	</section>

	<dialog bind:this={confirmDialog} class="dialog" aria-labelledby="settle-group-heading">
		<div class="dialog__head">
			<h2 id="settle-group-heading">{m.settlement_confirmHeading({ name: data.group.name })}</h2>
		</div>
		<div class="dialog__body">
			<p class="alert alert--danger" role="alert">
				{m.settlement_confirmWarning({ name: data.group.name })}
			</p>
		</div>
		<form method="POST" action="?/confirm" class="dialog__actions" use:enhance>
			<Button type="button" onclick={() => confirmDialog?.close()}>{m.common_cancel()}</Button>
			<Button type="submit" variant="danger">{m.settlement_confirmCta()}</Button>
		</form>
	</dialog>
{:else if data.settlements.length === 0}
	<div class="empty"><p>{m.settlement_emptyClosed()}</p></div>
{:else if data.myReceivables.length > 0 || data.myPayables.length > 0}
	<section class="panel" aria-labelledby="your-overview-heading">
		<h2 id="your-overview-heading" class="panel__heading">{m.settlement_yourOverviewHeading()}</h2>
		<div class="table-wrap">
			<table class="table">
				{#if data.myReceivables.length > 0}
					<tbody>
						<tr class="settlement__person">
							<th scope="rowgroup" colspan="3">{m.settlement_toReceiveHeading()}</th>
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
						<tr class="settlement__person">
							<th scope="rowgroup" colspan="3">{m.settlement_toPayHeading()}</th>
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
