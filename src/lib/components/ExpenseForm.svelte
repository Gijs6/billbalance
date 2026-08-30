<script lang="ts">
	import { enhance } from '$app/forms';
	import { centsToInputValue, parseEuros, splitEqual } from '$lib/money';
	import * as m from '$lib/paraglide/messages';
	import Button from './Button.svelte';
	import FieldLabel from './FieldLabel.svelte';

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
		currentUserId = undefined,
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
		currentUserId?: string;
		initialCreatedAt?: number;
		action?: string;
		submitLabel: string;
		message?: string;
		initialDescription?: string;
		initialAmount?: string;
		initialPaidByUser?: string;
		initialConsumption?: Record<string, MemberConsumption>;
	} = $props();

	function memberLabel(member: MemberInfo): string {
		return member.id === currentUserId ? m.common_you() : member.name;
	}

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

	$effect(() => {
		for (const m of members) {
			if (!consumption[m.id].checked && consumption[m.id].consumed !== '') {
				consumption[m.id].consumed = '';
			}
		}
	});

	function equalize() {
		const totalCents = parseEuros(amount) ?? 0;
		const checkedIds = members.filter((m) => consumption[m.id].checked).map((m) => m.id);
		if (checkedIds.length === 0) return;

		const consumedAmounts = splitEqual(totalCents, checkedIds, createdAt);
		for (const id of checkedIds) {
			consumption[id].consumed = centsToInputValue(consumedAmounts[id]);
		}
	}

	function onConsumedInput(id: string) {
		if (parseEuros(consumption[id].consumed) === 0) {
			consumption[id].checked = false;
		}
	}
</script>

<form method="POST" {action} class="form form--wide" use:enhance>
	{#if message}
		<p class="form__error" role="alert">{message}</p>
	{/if}

	<div class="form__field">
		<FieldLabel for="description">{m.expense_descriptionLabel()}</FieldLabel>
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
		<FieldLabel for="amount">{m.expense_amountLabel()}</FieldLabel>
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
		<FieldLabel for="paidByUser">{m.expense_paidByLabel()}</FieldLabel>
		<select class="form__select" id="paidByUser" name="paidByUser" bind:value={paidByUser} required>
			{#each members as member (member.id)}
				<option value={member.id}>{memberLabel(member)}</option>
			{/each}
		</select>
	</div>

	<fieldset class="form__field">
		<legend class="form__label">{m.expense_splitBetweenLegend()}</legend>
		<p class="form__hint">
			{m.expense_splitHint()}
		</p>
		<Button variant="secondary" block onclick={equalize}>{m.expense_splitEquallyCta()}</Button>
		<div class="form__checkbox-group">
			{#each members as member (member.id)}
				<div class="form__checkbox-row">
					<input
						type="checkbox"
						id="member_{member.id}"
						name="member_{member.id}"
						bind:checked={consumption[member.id].checked}
					/>
					<label for="member_{member.id}">{memberLabel(member)}</label>
					<input
						class="form__input"
						type="text"
						inputmode="decimal"
						placeholder="0.00"
						name="consumed_{member.id}"
						aria-label={member.id === currentUserId
							? m.expense_consumedAmountAriaOwn()
							: m.expense_consumedAmountAriaOther({ name: member.name })}
						disabled={!consumption[member.id].checked}
						bind:value={consumption[member.id].consumed}
						oninput={() => onConsumedInput(member.id)}
					/>
				</div>
			{/each}
		</div>
	</fieldset>

	<div class="form__actions">
		<Button type="submit">{submitLabel}</Button>
	</div>
</form>
