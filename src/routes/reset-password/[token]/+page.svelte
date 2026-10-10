<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageTitle title={m.auth_resetTitle()} />

<div class="page-head">
	<h1>{m.auth_resetTitle()}</h1>
</div>

<form method="POST" use:enhance>
	{#if form?.message}
		<p class="alert alert--danger" role="alert">{form.message}</p>
	{/if}

	<div class="field">
		<FieldLabel for="password">{m.auth_resetNewPasswordLabel()}</FieldLabel>
		<input
			id="password"
			type="password"
			name="password"
			autocomplete="new-password"
			required
			minlength="8"
		/>
	</div>

	<div class="form__actions">
		<Button type="submit">{m.auth_setPasswordCta()}</Button>
	</div>
</form>
