<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title={m.account_title()} />

<div class="page-head">
	<h1>{m.account_title()}</h1>
</div>

<fieldset class="fieldset">
	<legend>{m.account_nameHeading()}</legend>
	<form method="POST" action="?/updateName" use:enhance>
		{#if form?.nameMessage}
			<p class="alert alert--danger" role="alert">{form.nameMessage}</p>
		{/if}
		<div class="field">
			<FieldLabel for="name">{m.common_name()}</FieldLabel>
			<input
				id="name"
				type="text"
				name="name"
				autocomplete="name"
				required
				maxlength="100"
				value={data.user.name}
			/>
		</div>
		<div class="form__actions">
			<Button type="submit">{m.common_saveNameCta()}</Button>
		</div>
	</form>
</fieldset>

<fieldset class="fieldset">
	<legend>{m.account_passwordHeading()}</legend>
	<form method="POST" action="?/changePassword" use:enhance>
		{#if form?.passwordMessage}
			<p class="alert alert--danger" role="alert">{form.passwordMessage}</p>
		{/if}
		<div class="field">
			<FieldLabel for="currentPassword">{m.account_currentPasswordLabel()}</FieldLabel>
			<input
				id="currentPassword"
				type="password"
				name="currentPassword"
				autocomplete="current-password"
				required
			/>
		</div>
		<div class="field">
			<FieldLabel for="newPassword">{m.account_newPasswordLabel()}</FieldLabel>
			<input
				id="newPassword"
				type="password"
				name="newPassword"
				autocomplete="new-password"
				minlength="8"
				maxlength="255"
				required
			/>
		</div>
		<div class="field">
			<FieldLabel for="confirmPassword">{m.account_confirmNewPasswordLabel()}</FieldLabel>
			<input
				id="confirmPassword"
				type="password"
				name="confirmPassword"
				autocomplete="new-password"
				minlength="8"
				maxlength="255"
				required
			/>
		</div>
		<p class="muted">{m.account_changePasswordHint()}</p>
		<div class="form__actions">
			<Button type="submit">{m.account_changePasswordCta()}</Button>
		</div>
	</form>
</fieldset>

<fieldset class="fieldset">
	<legend>{m.account_deleteHeading()}</legend>
	{#if form?.deleteMessage}
		<p class="alert alert--danger" role="alert">{form.deleteMessage}</p>
	{/if}
	{#if data.groups.length > 0}
		<p class="muted">{m.account_cannotDeleteHint()}</p>
	{:else}
		<DangerZone label={m.account_deleteAccountCta()} question={m.account_deleteConfirmMessage()}>
			{#snippet hint()}
				{m.account_deleteHint()}
			{/snippet}
		</DangerZone>
	{/if}
</fieldset>
