<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { formatCents } from '$lib/money';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const currentUserId = $derived(data.user?.id);
</script>

<PageTitle title={data.isClosed ? 'Settlement' : `Settle ${data.group.name}`} />

{#if !data.isClosed}
	<h1>Settle group balance</h1>

	<p class="form__error" role="alert">
		This permanently <strong>closes {data.group.name}</strong>. No new expenses can be added, and
		nothing can be edited or deleted, ever again. This cannot be undone.
	</p>

	{#if data.edges.length > 0}
		<p>Review these pending payments before confirming:</p>
		<p class="form__hint">
			{data.edges.length}
			{data.edges.length === 1 ? 'payment' : 'payments'} totaling {formatCents(
				data.edges.reduce((sum, edge) => sum + edge.amountCents, 0)
			)}
		</p>
	{:else}
		<p class="empty-state">Everyone is already settled up.</p>
	{/if}
{:else if data.settlements.length === 0}
	<p class="empty-state">Everyone was already settled up when this group closed.</p>
{:else}
	<p class="form__hint">
		These are the payments from closing this group. Either person involved in a payment can mark it
		as paid once the money has actually changed hands.
	</p>

	{#if data.myReceivables.length > 0 || data.myPayables.length > 0}
		<section class="section" aria-labelledby="your-overview-heading">
			<h2 id="your-overview-heading" class="section__title">Your overview</h2>
			<ul class="list">
				{#each data.myReceivables as edge (edge.id)}
					<li class="list-item">
						<span class="list-item__title">{edge.fromName} should pay you</span>
						<span class="list-item__end">
							<span class="balance">{formatCents(edge.amountCents)}</span>
							{#if edge.status === 'paid'}
								<span class="tag tag--paid">Paid</span>
							{:else}
								<form method="POST" action="?/markPaid" use:enhance>
									<input type="hidden" name="settlementId" value={edge.id} />
									<button type="submit" class="button button--secondary button--small"
										>Mark as paid</button
									>
								</form>
							{/if}
						</span>
					</li>
				{/each}
				{#each data.myPayables as edge (edge.id)}
					<li class="list-item">
						<span class="list-item__title">You should pay {edge.toName}</span>
						<span class="list-item__end">
							<span class="balance">{formatCents(edge.amountCents)}</span>
							{#if edge.status === 'paid'}
								<span class="tag tag--paid">Paid</span>
							{:else}
								<form method="POST" action="?/markPaid" use:enhance>
									<input type="hidden" name="settlementId" value={edge.id} />
									<button type="submit" class="button button--secondary button--small"
										>Mark as paid</button
									>
								</form>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/if}

{#if data.creditors.length > 0}
	<section class="section" aria-labelledby="owed-heading">
		<h2 id="owed-heading" class="section__title">Who's owed money</h2>
		<ul class="settlement-list">
			{#each data.creditors as person (person.id)}
				<li class="settlement-list__group">
					<p class="settlement-list__person">
						<span class="list-item__title">{person.name}</span>
						<span class="balance-label balance-label--positive">
							is owed <span class="balance">{formatCents(person.totalCents)}</span>
						</span>
					</p>
					<ul class="list">
						{#each person.edges as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">by {edge.fromName}</span>
								<span class="list-item__end">
									<span class="balance">{formatCents(edge.amountCents)}</span>
									{#if data.isClosed}
										{#if edge.status === 'paid'}
											<span class="tag tag--paid">Paid</span>
										{:else if currentUserId === edge.fromUser || currentUserId === edge.toUser}
											<form method="POST" action="?/markPaid" use:enhance>
												<input type="hidden" name="settlementId" value={edge.id} />
												<button type="submit" class="button button--secondary button--small"
													>Mark as paid</button
												>
											</form>
										{:else}
											<span class="tag tag--pending">Pending</span>
										{/if}
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if data.debtors.length > 0}
	<section class="section" aria-labelledby="owes-heading">
		<h2 id="owes-heading" class="section__title">Who owes money</h2>
		<ul class="settlement-list">
			{#each data.debtors as person (person.id)}
				<li class="settlement-list__group">
					<p class="settlement-list__person">
						<span class="list-item__title">{person.name}</span>
						<span class="balance-label balance-label--negative">
							owes <span class="balance">{formatCents(person.totalCents)}</span>
						</span>
					</p>
					<ul class="list">
						{#each person.edges as edge (edge.id)}
							<li class="list-item">
								<span class="list-item__title">to {edge.toName}</span>
								<span class="list-item__end">
									<span class="balance">{formatCents(edge.amountCents)}</span>
									{#if data.isClosed}
										{#if edge.status === 'paid'}
											<span class="tag tag--paid">Paid</span>
										{:else if currentUserId === edge.fromUser || currentUserId === edge.toUser}
											<form method="POST" action="?/markPaid" use:enhance>
												<input type="hidden" name="settlementId" value={edge.id} />
												<button type="submit" class="button button--secondary button--small"
													>Mark as paid</button
												>
											</form>
										{:else}
											<span class="tag tag--pending">Pending</span>
										{/if}
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if !data.isClosed}
	<form method="POST" action="?/confirm" class="form__actions" use:enhance>
		<button type="submit" class="button">Confirm and close group</button>
		<a
			class="button button--secondary"
			href={resolve('/groups/[id]/balances', { id: data.group.id })}>Cancel</a
		>
	</form>
{/if}
