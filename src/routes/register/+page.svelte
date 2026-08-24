<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const loginHref = $derived(
		data.redirectTo
			? resolve(`/login?redirectTo=${encodeURIComponent(data.redirectTo)}`)
			: resolve('/login')
	);
</script>

<PageTitle title="Sign up" />

<h1>Create an account</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<label class="form__label" for="name">Name</label>
		<input
			class="form__input"
			id="name"
			type="text"
			name="name"
			autocomplete="name"
			required
			maxlength="100"
		/>
	</div>

	<div class="form__field">
		<label class="form__label" for="email">Email</label>
		<input
			class="form__input"
			id="email"
			type="email"
			name="email"
			autocomplete="email"
			required
			value={form?.email ?? ''}
		/>
	</div>

	<div class="form__field">
		<label class="form__label" for="password">Password</label>
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
		<button type="submit" class="button">Sign up</button>
	</div>
</form>

<p><a href={loginHref}>Already have an account? Log in</a></p>
