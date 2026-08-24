<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { centsToInputValue, formatCents } from '$lib/money';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// svelte-ignore state_referenced_locally
	const initialConsumption = Object.fromEntries(
		data.consumption.map((c) => [
			c.userId,
			{ checked: true, consumed: centsToInputValue(c.amountCents) }
		])
	);
	const memberName = (id: string) => data.members.find((m) => m.id === id)?.name ?? 'Unknown';
</script>

<PageTitle title={data.isClosed ? data.expense.description : 'Edit expense'} />

{#if data.isClosed}
	<h1>{data.expense.description}</h1>
	<p class="form__hint">This group is closed, so this expense is read-only.</p>
	<dl class="card">
		<dt class="form__label">Total</dt>
		<dd>{formatCents(data.expense.amountCents)}</dd>
		<dt class="form__label">Paid by</dt>
		<dd>
			{data.expense.paidByUser === data.user?.id ? 'you' : memberName(data.expense.paidByUser)}
		</dd>
		<dt class="form__label">Consumed</dt>
		<dd class="card__full">
			<ul class="list">
				{#each data.consumption as consumedAmount (consumedAmount.userId)}
					<li class="list-item">
						<span class="list-item__title">{memberName(consumedAmount.userId)}</span>
						<span class="balance">{formatCents(consumedAmount.amountCents)}</span>
					</li>
				{/each}
			</ul>
		</dd>
	</dl>
{:else}
	<h1>Edit expense</h1>

	<ExpenseForm
		members={data.members}
		initialCreatedAt={data.expense.createdAt.getTime()}
		action="?/update"
		submitLabel="Save changes"
		message={form && 'message' in form ? form.message : undefined}
		initialDescription={data.expense.description}
		initialAmount={centsToInputValue(data.expense.amountCents)}
		initialPaidByUser={data.expense.paidByUser}
		{initialConsumption}
	/>

	<div class="danger-zone">
		{#if form && 'needsDeleteConfirm' in form && form.needsDeleteConfirm}
			<p class="form__error" role="alert">
				Are you sure you want to delete <strong>{data.expense.description}</strong>? This cannot be
				undone.
			</p>
			<form method="POST" action="?/delete" class="form__actions" use:enhance>
				<input type="hidden" name="confirm" value="true" />
				<button type="submit" class="button button--danger">Yes, delete permanently</button>
				<a
					class="button button--secondary"
					href={resolve('/groups/[id]/expenses/[expenseId]', {
						id: data.expense.groupId,
						expenseId: data.expense.id
					})}>Cancel</a
				>
			</form>
		{:else}
			<form method="POST" action="?/delete" use:enhance>
				<button type="submit" class="button button--danger">Delete expense</button>
			</form>
		{/if}
	</div>
{/if}
