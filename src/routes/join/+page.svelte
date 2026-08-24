<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatHumanCodeInput } from '$lib/human-code';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	function formatCodeInput(event: Event & { currentTarget: HTMLInputElement }) {
		event.currentTarget.value = formatHumanCodeInput(event.currentTarget.value);
	}
</script>

<PageTitle title="Join a group" />

<h1>Join a group</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<label class="form__label" for="code">Join code</label>
		<input
			class="form__input"
			id="code"
			name="code"
			type="text"
			placeholder="ABCD-2345"
			required
			maxlength="9"
			autocomplete="off"
			autocapitalize="characters"
			spellcheck="false"
			value={formatHumanCodeInput(form?.code ?? '')}
			oninput={formatCodeInput}
		/>
	</div>

	<div class="form__actions">
		<button type="submit" class="button">Join group</button>
	</div>
</form>
