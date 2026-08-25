<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageTitle title="Set a new password" />

<h1>Set a new password</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<FieldLabel for="password">New password</FieldLabel>
		<input
			class="form__input"
			id="password"
			type="password"
			name="password"
			autocomplete="new-password"
			required
			minlength="8"
		/>
	</div>

	<div class="form__actions">
		<Button type="submit">Set password</Button>
	</div>
</form>
