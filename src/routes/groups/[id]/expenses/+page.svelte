<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);

	function effectLabelClass(cents: number): string {
		if (cents > 0) return 'balance-label balance-label--positive';
		if (cents < 0) return 'balance-label balance-label--negative';
		return 'balance-label balance-label--zero';
	}

	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<PageTitle title="Expenses" />

{#if !data.isClosed}
	<p class="form__actions">
		<a class="button" href={resolve('/groups/[id]/expenses/new', { id: groupId })}>Add expense</a>
	</p>
{/if}

{#if data.expenses.length > 0}
	<ul class="list">
		{#each data.expenses as expense (expense.id)}
			<li>
				<a
					class="list-item list-item--expense"
					href={resolve('/groups/[id]/expenses/[expenseId]', {
						id: groupId,
						expenseId: expense.id
					})}
				>
					<span>
						<span class="list-item__title">{expense.description}</span><br />
						<span class="list-item__meta"
							>Paid by {expense.paidByName} · {dateFormatter.format(expense.createdAt)}</span
						>
					</span>
					<span class="list-item__amounts">
						<span class="balance">{formatCents(expense.amountCents)}</span>
						<span class={effectLabelClass(expense.myEffectCents)}>
							{#if expense.myEffectCents === 0}
								no effect on your balance
							{:else}
								<span class="balance"
									>{expense.myEffectCents > 0 ? '+' : ''}{formatCents(expense.myEffectCents)}</span
								> for your balance
							{/if}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p class="empty-state">
		No expenses yet.
		{#if !data.isClosed}
			<a href={resolve('/groups/[id]/expenses/new', { id: groupId })}>Add the first one</a>.
		{/if}
	</p>
{/if}
