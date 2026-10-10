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

<PageTitle title={m.auth_forgotTitle()} />

<div class="page-head">
	<h1>{m.auth_forgotHeading()}</h1>
</div>

{#if form?.sent}
	<p>{m.auth_forgotSent()}</p>
{:else}
	<form method="POST" use:enhance>
		{#if form?.message}
			<p class="alert alert--danger" role="alert">{form.message}</p>
		{/if}

		<div class="field">
			<FieldLabel for="email">{m.common_email()}</FieldLabel>
			<input id="email" type="email" name="email" autocomplete="email" required />
		</div>

		<div class="form__actions">
			<Button type="submit">{m.auth_sendResetLinkCta()}</Button>
		</div>
	</form>
{/if}

<p><a href={resolve('/login')}>{m.auth_backToSignInLink()}</a></p>
