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
	<h2>{data.expense.description}</h2>
	<p class="alert">{m.expense_closedHint()}</p>
	<table class="table table--kv">
		<tbody>
			<tr>
				<th scope="row">{m.expense_totalLabel()}</th>
				<td class="balance">{formatCents(data.expense.amountCents, locale)}</td>
			</tr>
			<tr>
				<th scope="row">{m.expense_paidByLabel()}</th>
				<td>
					{data.expense.paidByUser === data.user?.id
						? m.common_youLower()
						: memberName(data.expense.paidByUser)}
				</td>
			</tr>
		</tbody>
	</table>
	<h3>{m.expense_consumedLabel()}</h3>
	<table class="table">
		<tbody>
			{#each data.consumption as consumedAmount (consumedAmount.userId)}
				<tr>
					<td>
						{consumedAmount.userId === data.user?.id
							? m.common_you()
							: memberName(consumedAmount.userId)}
					</td>
					<td class="table__num balance">{formatCents(consumedAmount.amountCents, locale)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<h2>{m.expense_editTitle()}</h2>

	<ExpenseForm
		members={data.members}
		currentUserId={data.user?.id}
		initialCreatedAt={data.expense.createdAt.getTime()}
		action="?/update"
		submitLabel={m.expense_saveCta()}
		message={form && 'message' in form ? form.message : undefined}
		initialDescription={data.expense.description}
		initialAmount={centsToInputValue(data.expense.amountCents)}
		initialPaidByUser={data.expense.paidByUser}
		{initialConsumption}
	/>

	<fieldset class="fieldset expense-delete">
		<legend>{m.expense_deleteExpenseCta()}</legend>
		<DangerZone
			needsConfirm={Boolean(form && 'needsDeleteConfirm' in form && form.needsDeleteConfirm)}
			confirmLabel={m.expense_deleteExpenseCta()}
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
	</fieldset>
{/if}
