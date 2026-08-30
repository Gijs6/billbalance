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
	<div class="page-header">
		<h1>{m.settlement_previewTitle()}</h1>
		<div class="page-header__actions">
			<Button type="button" onclick={() => confirmDialog?.showModal()}>
				{m.balances_settleCta()}
			</Button>
		</div>
	</div>

	<dialog bind:this={confirmDialog} class="modal" aria-labelledby="settle-group-heading">
		<h2 id="settle-group-heading">{m.settlement_confirmHeading({ name: data.group.name })}</h2>
		<p class="form__error" role="alert">
			{m.settlement_confirmWarning({ name: data.group.name })}
		</p>
		<form method="POST" action="?/confirm" class="form__actions" use:enhance>
			<Button type="submit">{m.settlement_confirmCta()}</Button>
			<Button type="button" variant="secondary" onclick={() => confirmDialog?.close()}>
				{m.common_cancel()}
			</Button>
		</form>
	</dialog>

	{#if data.edges.length > 0}
		<p>{m.settlement_previewIntro()}</p>
		<p class="settlement-summary">
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
		<p class="empty-state">{m.settlement_emptyPreview()}</p>
	{/if}
{:else if data.settlements.length === 0}
	<p class="empty-state">{m.settlement_emptyClosed()}</p>
{:else}
	{#if data.myReceivables.length > 0 || data.myPayables.length > 0}
		<section class="section" aria-labelledby="your-overview-heading">
			<h2 id="your-overview-heading" class="section__title">
				{m.settlement_yourOverviewHeading()}
			</h2>
			{#if data.myReceivables.length > 0}
				<div class="section__subsection" aria-labelledby="to-receive-heading">
					<h3 id="to-receive-heading" class="section__subtitle">
						{m.settlement_toReceiveHeading()}
					</h3>
					<ul class="list">
						{#each data.myReceivables as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">{m.settlement_owesYou({ name: edge.fromName })}</span
								>
								<SettlementEdgeStatus {edge} {currentUserId} />
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if data.myPayables.length > 0}
				<div class="section__subsection" aria-labelledby="to-pay-heading">
					<h3 id="to-pay-heading" class="section__subtitle">{m.settlement_toPayHeading()}</h3>
					<ul class="list">
						{#each data.myPayables as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">{m.settlement_youOwe({ name: edge.toName })}</span>
								<SettlementEdgeStatus {edge} {currentUserId} />
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}
{/if}

{#if data.creditors.length > 0}
	<section class="section" aria-labelledby="owed-heading">
		<h2 id="owed-heading" class="section__title">{m.settlement_owedHeading()}</h2>
		<ul class="settlement-list">
			{#each data.creditors as person (person.id)}
				<SettlementGroup {person} direction="creditor" {currentUserId} showStatus={data.isClosed} />
			{/each}
		</ul>
	</section>
{/if}

{#if data.debtors.length > 0}
	<section class="section" aria-labelledby="owes-heading">
		<h2 id="owes-heading" class="section__title">{m.settlement_owesHeading()}</h2>
		<ul class="settlement-list">
			{#each data.debtors as person (person.id)}
				<SettlementGroup {person} direction="debtor" {currentUserId} showStatus={data.isClosed} />
			{/each}
		</ul>
	</section>
{/if}
