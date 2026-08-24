<script lang="ts">
	import { enhance } from '$app/forms';
	import { centsToInputValue, parseEuros, splitEqual } from '$lib/money';

	interface MemberInfo {
		id: string;
		name: string;
	}

	interface MemberConsumption {
		checked: boolean;
		consumed: string;
	}

	let {
		members,
		initialCreatedAt = undefined,
		action = undefined,
		submitLabel,
		message,
		initialDescription = '',
		initialAmount = '',
		initialPaidByUser = '',
		initialConsumption = {}
	}: {
		members: MemberInfo[];
		initialCreatedAt?: number;
		action?: string;
		submitLabel: string;
		message?: string;
		initialDescription?: string;
		initialAmount?: string;
		initialPaidByUser?: string;
		initialConsumption?: Record<string, MemberConsumption>;
	} = $props();

	// svelte-ignore state_referenced_locally
	const createdAt = initialCreatedAt ?? Date.now();

	// svelte-ignore state_referenced_locally
	let description = $state(initialDescription);
	// svelte-ignore state_referenced_locally
	let amount = $state(initialAmount);
	// svelte-ignore state_referenced_locally
	let paidByUser = $state(initialPaidByUser || members[0]?.id || '');

	// svelte-ignore state_referenced_locally
	const consumption = $state(
		Object.fromEntries(
			members.map((m) => [
				m.id,
				{
					checked: initialConsumption[m.id]?.checked ?? true,
					consumed: initialConsumption[m.id]?.consumed ?? ''
				}
			])
		)
	);

	function equalize() {
		const totalCents = parseEuros(amount) ?? 0;
		const checkedIds = members.filter((m) => consumption[m.id].checked).map((m) => m.id);
		if (checkedIds.length === 0) return;

		const consumedAmounts = splitEqual(totalCents, checkedIds, createdAt);
		for (const id of checkedIds) {
			consumption[id].consumed = centsToInputValue(consumedAmounts[id]);
		}
	}

	$effect(() => {
		for (const m of members) {
			if (consumption[m.id].checked && parseEuros(consumption[m.id].consumed) === 0) {
				consumption[m.id].checked = false;
			}
		}
	});
</script>

<form method="POST" {action} class="form form--wide" use:enhance>
	{#if message}
		<p class="form__error" role="alert">{message}</p>
	{/if}

	<div class="form__field">
		<label class="form__label" for="description">Description</label>
		<input
			class="form__input"
			id="description"
			name="description"
			type="text"
			required
			maxlength="200"
			bind:value={description}
		/>
	</div>

	<div class="form__field">
		<label class="form__label" for="amount">Total amount (€)</label>
		<input
			class="form__input"
			id="amount"
			name="amount"
			type="text"
			inputmode="decimal"
			placeholder="0.00"
			required
			bind:value={amount}
		/>
	</div>

	<div class="form__field">
		<label class="form__label" for="paidByUser">Paid by</label>
		<select class="form__select" id="paidByUser" name="paidByUser" bind:value={paidByUser} required>
			{#each members as member (member.id)}
				<option value={member.id}>{member.name}</option>
			{/each}
		</select>
	</div>

	<fieldset class="form__field">
		<legend class="form__label">Split between</legend>
		<p class="form__hint">
			Choose who consumed part of this expense, and how much. Use "Split equally" to split evenly
			among the selected members.
		</p>
		<button type="button" class="button button--secondary button--block" onclick={equalize}>
			Split equally
		</button>
		<div class="form__checkbox-group">
			{#each members as member (member.id)}
				<div class="form__checkbox-row">
					<input
						type="checkbox"
						id="member_{member.id}"
						name="member_{member.id}"
						bind:checked={consumption[member.id].checked}
					/>
					<label for="member_{member.id}">{member.name}</label>
					<input
						class="form__input"
						type="text"
						inputmode="decimal"
						placeholder="0.00"
						name="consumed_{member.id}"
						aria-label="{member.name}'s consumed amount in euros"
						disabled={!consumption[member.id].checked}
						bind:value={consumption[member.id].consumed}
					/>
				</div>
			{/each}
		</div>
	</fieldset>

	<div class="form__actions">
		<button type="submit" class="button">{submitLabel}</button>
	</div>
</form>
