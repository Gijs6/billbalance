<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const loginHref = $derived(
		data.redirectTo
			? resolve(`/login?redirectTo=${encodeURIComponent(data.redirectTo)}`)
			: resolve('/login')
	);
</script>

<PageTitle title={m.common_signUp()} />

<h1>{m.auth_registerHeading()}</h1>

<form method="POST" class="form" use:enhance>
	{#if form?.message}
		<p class="form__error" role="alert">{form.message}</p>
	{/if}

	<div class="form__field">
		<FieldLabel for="name">{m.common_name()}</FieldLabel>
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
		<FieldLabel for="email">{m.common_email()}</FieldLabel>
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
		<FieldLabel for="password">{m.common_password()}</FieldLabel>
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
		<Button type="submit">{m.common_signUp()}</Button>
	</div>
</form>

<p>{m.auth_alreadyHaveAccountPrefix()} <a href={loginHref}>{m.common_logIn()}</a></p>
