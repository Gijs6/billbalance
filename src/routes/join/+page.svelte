<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatHumanCodeInput } from '$lib/human-code';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	function formatCodeInput(event: Event & { currentTarget: HTMLInputElement }) {
		event.currentTarget.value = formatHumanCodeInput(event.currentTarget.value);
	}
</script>

<PageTitle title={m.join_title()} />

<h1>{m.join_title()}</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<FieldLabel for="code">{m.join_codeLabel()}</FieldLabel>
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
		<Button type="submit">{m.join_joinGroupCta()}</Button>
	</div>
</form>
