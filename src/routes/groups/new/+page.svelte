<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageTitle title="New group" />

<h1>New group</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<label class="form__label" for="name">Group name</label>
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
		<button type="submit" class="button">Create group</button>
		<a class="button button--secondary" href={resolve('/')}>Cancel</a>
	</div>
</form>
