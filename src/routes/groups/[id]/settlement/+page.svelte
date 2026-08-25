<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCents } from '$lib/money';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SettlementEdgeStatus from '$lib/components/SettlementEdgeStatus.svelte';
	import SettlementGroup from '$lib/components/SettlementGroup.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const currentUserId = $derived(data.user?.id);
	const locale = getLocale();

	let confirmDialog: HTMLDialogElement | undefined = $state();
</script>

<PageTitle title={data.isClosed ? 'Settlement' : 'Settlement preview'} />

{#if !data.isClosed}
	<div class="page-header">
		<h1>Settlement preview</h1>
		<div class="page-header__actions">
			<Button type="button" onclick={() => confirmDialog?.showModal()}>Settle group balance</Button>
		</div>
	</div>

	<dialog bind:this={confirmDialog} class="modal" aria-labelledby="settle-group-heading">
		<h2 id="settle-group-heading">Settle {data.group.name}?</h2>
		<p class="form__error" role="alert">
			This permanently settles {data.group.name}. No new expenses can be added, and nothing can be
			edited or deleted, ever again. This cannot be undone.
		</p>
		<form method="POST" action="?/confirm" class="form__actions" use:enhance>
			<Button type="submit">Confirm and settle group</Button>
			<Button type="button" variant="secondary" onclick={() => confirmDialog?.close()}>
				Cancel
			</Button>
		</form>
	</dialog>

	{#if data.edges.length > 0}
		<p>This is what the settlement would look like if you settled the group right now:</p>
		<p class="settlement-summary">
			{data.edges.length}
			{data.edges.length === 1 ? 'payment' : 'payments'} totaling
			<span class="balance"
				>{formatCents(
					data.edges.reduce((sum, edge) => sum + edge.amountCents, 0),
					locale
				)}</span
			>
		</p>
	{:else}
		<p class="empty-state">Everyone is already settled up.</p>
	{/if}
{:else if data.settlements.length === 0}
	<p class="empty-state">Everyone was already settled up when this group was settled.</p>
{:else}
	{#if data.myReceivables.length > 0 || data.myPayables.length > 0}
		<section class="section" aria-labelledby="your-overview-heading">
			<h2 id="your-overview-heading" class="section__title">Your overview</h2>
			{#if data.myReceivables.length > 0}
				<div class="section__subsection" aria-labelledby="to-receive-heading">
					<h3 id="to-receive-heading" class="section__subtitle">To receive</h3>
					<ul class="list">
						{#each data.myReceivables as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">{edge.fromName} should pay you</span>
								<SettlementEdgeStatus {edge} {currentUserId} />
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if data.myPayables.length > 0}
				<div class="section__subsection" aria-labelledby="to-pay-heading">
					<h3 id="to-pay-heading" class="section__subtitle">To pay</h3>
					<ul class="list">
						{#each data.myPayables as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">You should pay {edge.toName}</span>
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
		<h2 id="owed-heading" class="section__title">Who's owed money</h2>
		<ul class="settlement-list">
			{#each data.creditors as person (person.id)}
				<SettlementGroup {person} direction="creditor" {currentUserId} showStatus={data.isClosed} />
			{/each}
		</ul>
	</section>
{/if}

{#if data.debtors.length > 0}
	<section class="section" aria-labelledby="owes-heading">
		<h2 id="owes-heading" class="section__title">Who owes money</h2>
		<ul class="settlement-list">
			{#each data.debtors as person (person.id)}
				<SettlementGroup {person} direction="debtor" {currentUserId} showStatus={data.isClosed} />
			{/each}
		</ul>
	</section>
{/if}
