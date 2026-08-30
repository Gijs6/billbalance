<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageTitle title={m.group_newGroupCta()} />

<h1>{m.group_newGroupCta()}</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<FieldLabel for="name">{m.group_nameFieldLabel()}</FieldLabel>
		<input
			class="form__input"
			id="name"
			type="text"
			name="name"
			required
			maxlength="100"
			value={form?.name ?? ''}
		/>
	</div>

	<div class="form__actions">
		<Button type="submit">{m.group_createCta()}</Button>
		<Button variant="secondary" href={resolve('/')}>{m.common_cancel()}</Button>
	</div>
</form>
