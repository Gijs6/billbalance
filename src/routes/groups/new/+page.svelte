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

<div class="page-head">
	<h1>{m.group_newGroupCta()}</h1>
</div>

<form method="POST" use:enhance>
	{#if form?.message}
		<p class="alert alert--danger" role="alert">{form.message}</p>
	{/if}

	<div class="field">
		<FieldLabel for="name">{m.group_nameFieldLabel()}</FieldLabel>
		<input id="name" type="text" name="name" required maxlength="100" value={form?.name ?? ''} />
	</div>

	<div class="form__actions">
		<Button type="submit">{m.group_createCta()}</Button>
		<Button href={resolve('/')}>{m.common_cancel()}</Button>
	</div>
</form>
