<script lang="ts">
	import { resolve } from '$app/paths';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { centsToInputValue, formatCents } from '$lib/money';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const locale = getLocale();

	// svelte-ignore state_referenced_locally
	const consumptionByUserId = new Map(data.consumption.map((c) => [c.userId, c]));
	// svelte-ignore state_referenced_locally
	const initialConsumption = Object.fromEntries(
		data.members.map((m) => {
			const c = consumptionByUserId.get(m.id);
			return [
				m.id,
				{ checked: c !== undefined, consumed: c ? centsToInputValue(c.amountCents) : '' }
			];
		})
	);
	const memberName = (id: string) =>
		data.members.find((m) => m.id === id)?.name ?? m.common_unknown();
</script>

<PageTitle title={data.isClosed ? data.expense.description : m.expense_editTitle()} />

{#if data.isClosed}
	<h1>{data.expense.description}</h1>
	<p class="form__hint">{m.expense_closedHint()}</p>
	<dl class="card">
		<dt class="form__label">{m.expense_totalLabel()}</dt>
		<dd>{formatCents(data.expense.amountCents, locale)}</dd>
		<dt class="form__label">{m.expense_paidByLabel()}</dt>
		<dd>
			{data.expense.paidByUser === data.user?.id
				? m.common_youLower()
				: memberName(data.expense.paidByUser)}
		</dd>
		<dt class="form__label">{m.expense_consumedLabel()}</dt>
		<dd class="card__full">
			<ul class="list">
				{#each data.consumption as consumedAmount (consumedAmount.userId)}
					<li class="list-item">
						<span class="list-item__title"
							>{consumedAmount.userId === data.user?.id
								? m.common_you()
								: memberName(consumedAmount.userId)}</span
						>
						<span class="balance">{formatCents(consumedAmount.amountCents, locale)}</span>
					</li>
				{/each}
			</ul>
		</dd>
	</dl>
{:else}
	<h1>{m.expense_editTitle()}</h1>

	<ExpenseForm
		members={data.members}
		currentUserId={data.user?.id}
		initialCreatedAt={data.expense.createdAt.getTime()}
		action="?/update"
		submitLabel={m.expense_saveChangesCta()}
		message={form && 'message' in form ? form.message : undefined}
		initialDescription={data.expense.description}
		initialAmount={centsToInputValue(data.expense.amountCents)}
		initialPaidByUser={data.expense.paidByUser}
		{initialConsumption}
	/>

	<DangerZone
		needsConfirm={Boolean(form && 'needsDeleteConfirm' in form && form.needsDeleteConfirm)}
		confirmLabel={m.group_deletePermanentlyCta()}
		cancelHref={resolve('/groups/[id]/expenses/[expenseId]', {
			id: data.expense.groupId,
			expenseId: data.expense.id
		})}
		deleteLabel={m.expense_deleteExpenseCta()}
	>
		{#snippet confirmMessage()}
			{m.common_deleteConfirmPrefix()}
			<strong>{data.expense.description}</strong>{m.expense_deleteConfirmSuffix()}
		{/snippet}
	</DangerZone>
{/if}
