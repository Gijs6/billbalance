<script lang="ts">
	import { enhance } from '$app/forms';
	import { centsToInputValue, parseEuros, splitEqual } from '$lib/money';

	interface MemberInfo {
		id: string;
		name: string;
	}

	interface ParticipantInitial {
		checked: boolean;
		share: string;
	}

	let {
		members,
		createdAt: initialCreatedAt = undefined,
		action = undefined,
		submitLabel,
		errorMessage,
		initialDescription = '',
		initialAmount = '',
		initialPaidBy = '',
		initialParticipants = {}
	}: {
		members: MemberInfo[];
		createdAt?: number;
		action?: string;
		submitLabel: string;
		errorMessage?: string;
		initialDescription?: string;
		initialAmount?: string;
		initialPaidBy?: string;
		initialParticipants?: Record<string, ParticipantInitial>;
	} = $props();

	const createdAt = initialCreatedAt ?? Date.now();

	let description = $state(initialDescription);
	let amount = $state(initialAmount);
	let paidBy = $state(initialPaidBy || members[0]?.id || '');

	const participants = $state(
		Object.fromEntries(
			members.map((m) => [
				m.id,
				{
					checked: initialParticipants[m.id]?.checked ?? true,
					share: initialParticipants[m.id]?.share ?? ''
				}
			])
		)
	);

	function equalize() {
		const totalCents = parseEuros(amount) ?? 0;
		const checkedIds = members.filter((m) => participants[m.id].checked).map((m) => m.id);
		if (checkedIds.length === 0) return;

		const shares = splitEqual(totalCents, checkedIds, createdAt);
		for (const id of checkedIds) {
			participants[id].share = centsToInputValue(shares[id]);
		}
	}
</script>

<form method="POST" {action} class="form form--wide" use:enhance>
	{#if errorMessage}
		<p class="form__error" role="alert">{errorMessage}</p>
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
		<label class="form__label" for="paidBy">Paid by</label>
		<select class="form__select" id="paidBy" name="paidBy" bind:value={paidBy} required>
			{#each members as member (member.id)}
				<option value={member.id}>{member.name}</option>
			{/each}
		</select>
	</div>

	<fieldset class="form__field">
		<legend class="form__label">Split between</legend>
		<p class="form__hint">
			Choose who owes a share, and how much. Use "Equalize" to split evenly among the selected
			people.
		</p>
		<div class="form__checkbox-group">
			{#each members as member (member.id)}
				<div class="form__checkbox-row">
					<input
						type="checkbox"
						id="participant_{member.id}"
						name="participant_{member.id}"
						bind:checked={participants[member.id].checked}
					/>
					<label for="participant_{member.id}" style="flex: 1;">{member.name}</label>
					<input
						class="form__input"
						style="max-width: 8rem;"
						type="text"
						inputmode="decimal"
						placeholder="0.00"
						name="share_{member.id}"
						aria-label="{member.name}'s share in euros"
						disabled={!participants[member.id].checked}
						bind:value={participants[member.id].share}
					/>
				</div>
			{/each}
		</div>
		<div class="form__actions" style="margin-top: 0.5rem;">
			<button type="button" class="button button--secondary button--small" onclick={equalize}>
				Equalize
			</button>
		</div>
	</fieldset>

	<div class="form__actions">
		<button type="submit" class="button">{submitLabel}</button>
	</div>
</form>
