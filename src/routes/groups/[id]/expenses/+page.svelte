<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BalanceLabel from '$lib/components/BalanceLabel.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);

	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<PageTitle title="Expenses" />

{#if !data.isClosed}
	<p class="form__actions">
		<Button href={resolve('/groups/[id]/expenses/new', { id: groupId })}>Add expense</Button>
	</p>
{:else}
	<p class="form__hint">This group is closed. No new expenses can be added.</p>
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
						<BalanceLabel cents={expense.myEffectCents}>
							{#snippet positive()}
								<span class="balance">+{formatCents(expense.myEffectCents)}</span> for your balance
							{/snippet}
							{#snippet negative()}
								<span class="balance">{formatCents(expense.myEffectCents)}</span> for your balance
							{/snippet}
							{#snippet zero()}no effect on your balance{/snippet}
						</BalanceLabel>
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
