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

<h1>{m.auth_forgotHeading()}</h1>

{#if form?.sent}
	<p>{m.auth_forgotSent()}</p>
{:else}
	<form method="POST" class="form" use:enhance>
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
			/>
		</div>

		<div class="form__actions">
			<Button type="submit">{m.auth_sendResetLinkCta()}</Button>
		</div>
	</form>
{/if}

<p><a href={resolve('/login')}>{m.auth_backToLoginLink()}</a></p>
