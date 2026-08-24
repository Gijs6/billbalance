<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageTitle title="Forgot password" />

<h1>Reset your password</h1>

{#if form?.sent}
	<p>If an account exists for that email, we've sent a password reset link.</p>
{:else}
	<form method="POST" class="form" use:enhance>
		<div class="form__field">
			<label class="form__label" for="email">Email</label>
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
			<button type="submit" class="button">Send reset link</button>
		</div>
	</form>
{/if}

<p><a href={resolve('/login')}>Back to login</a></p>
