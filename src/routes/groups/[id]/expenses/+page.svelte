<script lang="ts">
	import { formatCents } from '$lib/money';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BalanceLabel from '$lib/components/BalanceLabel.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupId = $derived(page.params.id!);
	const locale = getLocale();

	const dateFormatter = new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<PageTitle title={m.group_tabExpenses()} />

{#if !data.isClosed}
	<p class="page-actions">
		<Button href={resolve('/groups/[id]/expenses/new', { id: groupId })}>
			{m.expenses_addCta()}
		</Button>
	</p>
{:else}
	<p class="alert">{m.expenses_closedHint()}</p>
{/if}

{#if data.expenses.length > 0}
	<div class="table-wrap">
		<table class="table">
			<thead>
				<tr>
					<th scope="col">{m.expense_descriptionLabel()}</th>
					<th scope="col">{m.expense_paidByLabel()}</th>
					<th scope="col" class="table__num">{m.expense_totalLabel()}</th>
					<th scope="col" class="table__num">{m.balances_balanceLabel()}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.expenses as expense (expense.id)}
					<tr>
						<td>
							<a
								class="row__title"
								href={resolve('/groups/[id]/expenses/[expenseId]', {
									id: groupId,
									expenseId: expense.id
								})}>{expense.description}</a
							>
							<span class="table__sub">{dateFormatter.format(expense.createdAt)}</span>
						</td>
						<td>{expense.paidByName}</td>
						<td class="table__num balance">{formatCents(expense.amountCents, locale)}</td>
						<td class="table__num">
							<BalanceLabel cents={expense.myEffectCents}>
								{#snippet positive()}
									<span class="balance">+{formatCents(expense.myEffectCents, locale)}</span>
									{m.expenses_forYourBalance()}
								{/snippet}
								{#snippet negative()}
									<span class="balance">{formatCents(expense.myEffectCents, locale)}</span>
									{m.expenses_forYourBalance()}
								{/snippet}
								{#snippet zero()}{m.expenses_noBalanceEffect()}{/snippet}
							</BalanceLabel>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<div class="empty">
		<p class="empty__title">{m.expenses_emptyTitle()}</p>
	</div>
{/if}
