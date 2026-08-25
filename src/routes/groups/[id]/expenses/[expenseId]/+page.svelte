<script lang="ts">
	import { resolve } from '$app/paths';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { centsToInputValue, formatCents } from '$lib/money';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
						<span class="list-item__title"
							>{consumedAmount.userId === data.user?.id
								? 'You'
								: memberName(consumedAmount.userId)}</span
						>
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
		currentUserId={data.user?.id}
		initialCreatedAt={data.expense.createdAt.getTime()}
		action="?/update"
		submitLabel="Save changes"
		message={form && 'message' in form ? form.message : undefined}
		initialDescription={data.expense.description}
		initialAmount={centsToInputValue(data.expense.amountCents)}
		initialPaidByUser={data.expense.paidByUser}
		{initialConsumption}
	/>

	<DangerZone
		needsConfirm={Boolean(form && 'needsDeleteConfirm' in form && form.needsDeleteConfirm)}
		confirmLabel="Yes, delete permanently"
		cancelHref={resolve('/groups/[id]/expenses/[expenseId]', {
			id: data.expense.groupId,
			expenseId: data.expense.id
		})}
		deleteLabel="Delete expense"
	>
		{#snippet confirmMessage()}
			Are you sure you want to delete <strong>{data.expense.description}</strong>? This cannot be
			undone.
		{/snippet}
	</DangerZone>
{/if}
