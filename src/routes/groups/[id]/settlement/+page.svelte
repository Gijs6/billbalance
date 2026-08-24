<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCents } from '$lib/money';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const currentUserId = $derived(data.user?.id);
</script>

<PageTitle title="Settlement" />

{#if data.settlements.length === 0}
	<p class="empty-state">Everyone was already settled up when this group closed.</p>
{:else}
	<p class="form__hint">
		These are the payments from closing this group. Either person involved in a payment can mark it
		as paid once the money has actually changed hands.
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
						<th scope="col">Status</th>
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
								<td>
									{#if edge.status === 'paid'}
										<span class="tag">Paid</span>
									{:else if currentUserId === edge.fromUser || currentUserId === edge.toUser}
										<form method="POST" action="?/markPaid" use:enhance>
											<input type="hidden" name="settlementId" value={edge.id} />
											<button type="submit" class="button button--secondary button--small"
												>Mark as paid</button
											>
										</form>
									{:else}
										<span class="tag">Pending</span>
									{/if}
								</td>
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
						<th scope="col">Status</th>
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
								<td>
									{#if edge.status === 'paid'}
										<span class="tag">Paid</span>
									{:else if currentUserId === edge.fromUser || currentUserId === edge.toUser}
										<form method="POST" action="?/markPaid" use:enhance>
											<input type="hidden" name="settlementId" value={edge.id} />
											<button type="submit" class="button button--secondary button--small"
												>Mark as paid</button
											>
										</form>
									{:else}
										<span class="tag">Pending</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</section>
	{/if}
{/if}
