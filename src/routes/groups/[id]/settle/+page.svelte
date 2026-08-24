<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { formatCents } from '$lib/money';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const totalCents = $derived(data.edges.reduce((sum, edge) => sum + edge.amountCents, 0));
</script>

<PageTitle title="Settle {data.group.name}" />

<h1>Settle group balance</h1>

<p class="form__error" role="alert">
	This permanently <strong>closes {data.group.name}</strong>. No new expenses can be added, and
	nothing can be edited or deleted, ever again. This cannot be undone.
</p>

{#if data.edges.length > 0}
	<p>Review these pending payments before confirming:</p>
	<p class="form__hint">
		{data.edges.length}
		{data.edges.length === 1 ? 'payment' : 'payments'} totaling {formatCents(totalCents)}
	</p>

	{#if data.creditors.length > 0}
		<section class="section" aria-labelledby="owed-heading">
			<h2 id="owed-heading" class="section__title">Who's owed money</h2>
			<table class="settlement-table">
				<caption class="visually-hidden">Payments owed to each group member</caption>
				<thead>
					<tr>
						<th scope="col">Person</th>
						<th scope="col">From</th>
						<th scope="col">Amount</th>
					</tr>
				</thead>
				<tbody>
					{#each data.creditors as person (person.id)}
						{#each person.edges as edge, i (edge.id)}
							<tr>
								{#if i === 0}
									<th
										scope="rowgroup"
										rowspan={person.edges.length}
										class="settlement-table__person"
									>
										{person.name} is owed {formatCents(person.totalCents)}
									</th>
								{/if}
								<td>by {edge.fromName}</td>
								<td class="settlement-table__amount">{formatCents(edge.amountCents)}</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	{#if data.debtors.length > 0}
		<section class="section" aria-labelledby="owes-heading">
			<h2 id="owes-heading" class="section__title">Who owes money</h2>
			<table class="settlement-table">
				<caption class="visually-hidden">Payments each group member owes</caption>
				<thead>
					<tr>
						<th scope="col">Person</th>
						<th scope="col">To</th>
						<th scope="col">Amount</th>
					</tr>
				</thead>
				<tbody>
					{#each data.debtors as person (person.id)}
						{#each person.edges as edge, i (edge.id)}
							<tr>
								{#if i === 0}
									<th
										scope="rowgroup"
										rowspan={person.edges.length}
										class="settlement-table__person"
									>
										{person.name} owes {formatCents(person.totalCents)}
									</th>
								{/if}
								<td>to {edge.toName}</td>
								<td class="settlement-table__amount">{formatCents(edge.amountCents)}</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</section>
	{/if}
{:else}
	<p class="empty-state">Everyone is already settled up.</p>
{/if}

<form
	method="POST"
	action="?/confirm"
	class="form__actions"
	style="margin-top: 1.5rem;"
	use:enhance
>
	<button type="submit" class="button">Confirm and close group</button>
	<a class="button button--secondary" href={resolve('/groups/[id]/balances', { id: data.group.id })}
		>Cancel</a
	>
</form>
