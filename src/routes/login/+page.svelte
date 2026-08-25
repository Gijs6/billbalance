<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';
	import { untrack } from 'svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const registerHref = $derived(
		data.redirectTo
			? resolve(`/register?redirectTo=${encodeURIComponent(data.redirectTo)}`)
			: resolve('/register')
	);

	let showEmailLogin = $state(untrack(() => data.dummyUsers.length === 0));
</script>

<PageTitle title={m.common_logIn()} />

<h1>{m.common_logIn()}</h1>

{#if data.dummyUsers.length > 0 && !showEmailLogin}
	<div class="dummy-login">
		{#each data.dummyUsers as dummyUser (dummyUser.id)}
			<form method="POST" action="?/dummy" use:enhance>
				<input type="hidden" name="userId" value={dummyUser.id} />
				<Button type="submit" variant="secondary">{dummyUser.name}</Button>
			</form>
		{/each}
	</div>

	<p>
		<Button type="button" variant="link" onclick={() => (showEmailLogin = true)}>
			{m.auth_loginWithEmailCta()}
		</Button>
	</p>
{:else}
	<form method="POST" action="?/login" class="form" use:enhance>
		{#if form?.message}
			<p class="form__error" role="alert">{form.message}</p>
		{/if}

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
				autocomplete="current-password"
				required
			/>
		</div>

		<div class="form__actions">
			<Button type="submit">{m.common_logIn()}</Button>
		</div>
	</form>

	{#if data.dummyUsers.length > 0}
		<p>
			<Button type="button" variant="link" onclick={() => (showEmailLogin = false)}>
				{m.auth_backToDummyCta()}
			</Button>
		</p>
	{/if}
{/if}

<p>{m.auth_needAccountPrefix()} <a href={registerHref}>{m.common_signUp()}</a></p>
<p><a href={resolve('/forgot-password')}>{m.auth_forgotPasswordLink()}</a></p>
