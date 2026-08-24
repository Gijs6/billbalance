<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
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

<PageTitle title="Log in" />

<h1>Log in</h1>

{#if data.dummyUsers.length > 0 && !showEmailLogin}
	<div class="dummy-login">
		{#each data.dummyUsers as dummyUser (dummyUser.id)}
			<form method="POST" action="?/dummy" use:enhance>
				<input type="hidden" name="userId" value={dummyUser.id} />
				<button type="submit" class="button button--secondary">{dummyUser.name}</button>
			</form>
		{/each}
	</div>

	<p>
		<button type="button" class="button button--link" onclick={() => (showEmailLogin = true)}>
			Log in with email instead
		</button>
	</p>
{:else}
	<form method="POST" action="?/login" class="form" use:enhance>
		{#if form?.message}
			<p class="form__error" role="alert">{form.message}</p>
		{/if}

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
				autocomplete="current-password"
				required
			/>
		</div>

		<div class="form__actions">
			<button type="submit" class="button">Log in</button>
		</div>
	</form>

	{#if data.dummyUsers.length > 0}
		<p>
			<button type="button" class="button button--link" onclick={() => (showEmailLogin = false)}>
				Back to dummy user login
			</button>
		</p>
	{/if}
{/if}

<p><a href={registerHref}>Need an account? Sign up</a></p>
<p><a href={resolve('/forgot-password')}>Forgot your password?</a></p>
